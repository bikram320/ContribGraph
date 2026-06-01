import dotenv from 'dotenv'
dotenv.config()

import axios from 'axios'
import Developer from '../models/Developer.js'
import ContribEvent from '../models/ContribEvent.js'
import { buildSkillObjects } from './TagInferenceService.js'

// ─────────────────────────────────────────────────────
// WEIGHT MAP
// how many points each event type is worth
// stored here so ScoringEngine and Ingestion
// both use the same source of truth
// ─────────────────────────────────────────────────────
export const WEIGHT_MAP = {
    pr_merged:    10,
    review:        5,
    issue_closed:  3,
    push:          1,
    comment:       1,
}

// ─────────────────────────────────────────────────────
// createGitHubClient
// builds an axios instance with auth headers
// GitHub gives 60 req/hour unauthenticated
// with a token: 5000 req/hour
// ─────────────────────────────────────────────────────
const createGitHubClient = (accessToken) => {
    return axios.create({
        baseURL: 'https://api.github.com',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })
}

// ─────────────────────────────────────────────────────
// fetchUserRepos
// fetches all repos for the authenticated user
// used by TagInferenceService to build skill tags
// ─────────────────────────────────────────────────────
const fetchUserRepos = async (githubClient) => {
    try {
        const response = await githubClient.get('/user/repos', {
            params: {
                per_page: 100,     // max per page GitHub allows
                sort: 'updated',   // most recently updated first
                type: 'owner'      // only repos they own, not forks
            }
        })
        return response.data
    } catch (error) {
        console.error('fetchUserRepos error:', error.message)
        return []
    }
}

// ─────────────────────────────────────────────────────
// fetchPullRequestEvents
// fetches merged PRs across all repos
// merged PR = the highest-value contribution signal
// ─────────────────────────────────────────────────────
const fetchPullRequestEvents = async (githubClient, username) => {
    try {
        // search for PRs authored by this user that were merged
        const response = await githubClient.get('/search/issues', {
            params: {
                q: `author:${username} type:pr is:merged`,
                per_page: 100,
                sort: 'updated'
            }
        })

        return response.data.items.map(pr => ({
            githubEventId: `pr_merged_${pr.id}`,
            // ↑ prefix + GitHub's own ID = globally unique event identifier
            type: 'pr_merged',
            repoName: pr.repository_url.split('/repos/')[1],
            // e.g. "https://api.github.com/repos/bikram320/project" → "bikram320/project"
            occurredAt: new Date(pr.closed_at),
            weight: WEIGHT_MAP.pr_merged
        }))
    } catch (error) {
        console.error('fetchPullRequestEvents error:', error.message)
        return []
    }
}

// ─────────────────────────────────────────────────────
// fetchReviewEvents
// fetches code reviews submitted by this user
// reviews show collaborative engineering skills
// ─────────────────────────────────────────────────────
const fetchReviewEvents = async (githubClient, username) => {
    try {
        const response = await githubClient.get('/search/issues', {
            params: {
                q: `reviewed-by:${username} type:pr`,
                per_page: 100
            }
        })

        return response.data.items.map(pr => ({
            githubEventId: `review_${pr.id}`,
            type: 'review',
            repoName: pr.repository_url.split('/repos/')[1],
            occurredAt: new Date(pr.updated_at),
            weight: WEIGHT_MAP.review
        }))
    } catch (error) {
        console.error('fetchReviewEvents error:', error.message)
        return []
    }
}

// ─────────────────────────────────────────────────────
// fetchIssueEvents
// fetches issues closed/created by this user
// ─────────────────────────────────────────────────────
const fetchIssueEvents = async (githubClient, username) => {
    try {
        const response = await githubClient.get('/search/issues', {
            params: {
                q: `author:${username} type:issue is:closed`,
                per_page: 100
            }
        })

        return response.data.items.map(issue => ({
            githubEventId: `issue_closed_${issue.id}`,
            type: 'issue_closed',
            repoName: issue.repository_url.split('/repos/')[1],
            occurredAt: new Date(issue.closed_at),
            weight: WEIGHT_MAP.issue_closed
        }))
    } catch (error) {
        console.error('fetchIssueEvents error:', error.message)
        return []
    }
}

// ─────────────────────────────────────────────────────
// fetchPushEvents
// uses GitHub's events API for push events
// only last 90 days available from this endpoint
// ─────────────────────────────────────────────────────
const fetchPushEvents = async (githubClient, username) => {
    try {
        const response = await githubClient.get(`/users/${username}/events/public`, {
            params: { per_page: 100 }
        })

        // filter only PushEvents from the events stream
        return response.data
            .filter(event => event.type === 'PushEvent')
            .map(event => ({
                githubEventId: `push_${event.id}`,
                type: 'push',
                repoName: event.repo.name,
                occurredAt: new Date(event.created_at),
                weight: WEIGHT_MAP.push
            }))
    } catch (error) {
        console.error('fetchPushEvents error:', error.message)
        return []
    }
}

// ─────────────────────────────────────────────────────
// storeEvents
// saves raw event objects to MongoDB
// CRITICAL: uses insertMany with ordered:false + unique index
// to handle duplicates gracefully
// ─────────────────────────────────────────────────────
const storeEvents = async (devId, rawEvents, repos) => {
    if (rawEvents.length === 0) return 0

    // build a repo lookup map for fast topic/language access
    // { "bikram320/project": { topics: [...], language: "JavaScript" } }
    const repoMap = {}
    repos.forEach(repo => {
        repoMap[repo.full_name] = {
            topics: repo.topics || [],
            language: repo.language || null
        }
    })

    // enrich each event with repo metadata
    const enrichedEvents = rawEvents.map(event => ({
        ...event,
        devId,
        repoTopics: repoMap[event.repoName]?.topics || [],
        repoLanguage: repoMap[event.repoName]?.language || null
    }))

    try {
        const result = await ContribEvent.insertMany(enrichedEvents, {
            ordered: false
            // ↑ ordered: false means if one document fails (e.g. duplicate key),
            //   MongoDB continues inserting the rest instead of stopping
            //   this is critical — without it, one duplicate would abort the entire batch
        })
        return result.length
    } catch (error) {
        // error code 11000 = duplicate key — this is expected and fine
        // it means we already have some of these events stored
        if (error.code === 11000 || error.writeErrors) {
            const inserted = error.result?.nInserted || 0
            console.log(`Ingestion: ${inserted} new events stored (duplicates skipped)`)
            return inserted
        }
        throw error  // re-throw unexpected errors
    }
}

// ─────────────────────────────────────────────────────
// syncDeveloper — THE MAIN FUNCTION
// orchestrates the full ingestion pipeline for one developer
// called by the developer controller when user clicks "Sync"
// ─────────────────────────────────────────────────────
const syncDeveloper = async (devId, accessToken) => {
    // 1. find the developer
    const developer = await Developer.findById(devId)
    if (!developer) throw new Error('Developer not found')

    const username = developer.githubUsername
    const githubClient = createGitHubClient(accessToken)

    console.log(`Starting sync for ${username}...`)

    // 2. fetch all data from GitHub in parallel
    // Promise.all runs all fetches simultaneously
    // instead of waiting for each one sequentially
    // this cuts total fetch time by ~4x
    const [repos, prEvents, reviewEvents, issueEvents, pushEvents] =
        await Promise.all([
            fetchUserRepos(githubClient),
            fetchPullRequestEvents(githubClient, username),
            fetchReviewEvents(githubClient, username),
            fetchIssueEvents(githubClient, username),
            fetchPushEvents(githubClient, username),
        ])

    // 3. combine all events into one array
    const allEvents = [
        ...prEvents,
        ...reviewEvents,
        ...issueEvents,
        ...pushEvents
    ]

    console.log(`Fetched ${allEvents.length} events from GitHub`)

    // 4. store events — duplicates are handled gracefully
    const newEventsCount = await storeEvents(devId, allEvents, repos)

    // 5. update skills from repos
    const skills = buildSkillObjects(repos)
    // ↑ looks at all repos, maps languages + topics to skill objects

    // 6. update developer profile
    await Developer.findByIdAndUpdate(devId, {
        skills,
        lastSyncAt: new Date()
        // score is NOT updated here — ScoringEngine handles that separately
    })

    console.log(`Sync complete for ${username}: ${newEventsCount} new events`)

    return {
        newEventsCount,
        totalRepos: repos.length,
        skillsFound: skills.length
    }
}

export default {
    syncDeveloper,
    WEIGHT_MAP
}