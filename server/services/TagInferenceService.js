import dotenv from 'dotenv'
dotenv.config()

// ─────────────────────────────────────────────────────
// TOPIC MAP
// maps GitHub repo topics and languages → normalized skill tags
// GitHub topics are user-defined strings — messy and inconsistent
// we normalize them so "reactjs", "react-js", "react" all become "react"
// ─────────────────────────────────────────────────────
const TOPIC_MAP = {
    // JavaScript ecosystem
    'javascript': 'javascript',
    'typescript': 'typescript',
    'nodejs': 'nodejs',
    'node': 'nodejs',
    'node-js': 'nodejs',
    'expressjs': 'expressjs',
    'express': 'expressjs',
    'express-js': 'expressjs',
    'react': 'react',
    'reactjs': 'react',
    'react-js': 'react',
    'nextjs': 'nextjs',
    'next-js': 'nextjs',
    'vuejs': 'vuejs',
    'vue': 'vuejs',
    'angular': 'angular',

    // CSS / Styling
    'tailwindcss': 'tailwind',
    'tailwind': 'tailwind',
    'css': 'css',
    'sass': 'sass',
    'scss': 'sass',

    // Backend / languages
    'python': 'python',
    'django': 'django',
    'flask': 'flask',
    'fastapi': 'fastapi',
    'java': 'java',
    'springboot': 'springboot',
    'spring-boot': 'springboot',
    'golang': 'golang',
    'go': 'golang',
    'rust': 'rust',
    'php': 'php',
    'laravel': 'laravel',
    'ruby': 'ruby',
    'rails': 'rails',
    'ruby-on-rails': 'rails',
    'csharp': 'csharp',
    'dotnet': 'dotnet',
    'dotnetcore': 'dotnet',

    // Databases
    'mongodb': 'mongodb',
    'mongoose': 'mongodb',
    'postgresql': 'postgresql',
    'postgres': 'postgresql',
    'mysql': 'mysql',
    'redis': 'redis',
    'firebase': 'firebase',
    'supabase': 'supabase',
    'prisma': 'prisma',

    // DevOps / Cloud
    'docker': 'docker',
    'kubernetes': 'kubernetes',
    'k8s': 'kubernetes',
    'aws': 'aws',
    'azure': 'azure',
    'gcp': 'gcp',
    'terraform': 'terraform',
    'cicd': 'cicd',
    'github-actions': 'cicd',
    'devops': 'devops',
    'linux': 'linux',
    'nginx': 'nginx',

    // ML / Data
    'machine-learning': 'ml',
    'machinelearning': 'ml',
    'ml': 'ml',
    'deep-learning': 'deeplearning',
    'deeplearning': 'deeplearning',
    'tensorflow': 'tensorflow',
    'pytorch': 'pytorch',
    'data-science': 'datascience',
    'datascience': 'datascience',
    'pandas': 'python',
    'numpy': 'python',

    // Mobile
    'react-native': 'reactnative',
    'reactnative': 'reactnative',
    'flutter': 'flutter',
    'android': 'android',
    'ios': 'ios',
    'swift': 'swift',
    'kotlin': 'kotlin',

    // General
    'api': 'api',
    'rest-api': 'api',
    'restapi': 'api',
    'graphql': 'graphql',
    'websocket': 'websocket',
    'websockets': 'websocket',
    'blockchain': 'blockchain',
    'web3': 'web3',
    'solidity': 'solidity',
}

// maps GitHub's reported language names → our normalized tags
const LANGUAGE_MAP = {
    'JavaScript': 'javascript',
    'TypeScript': 'typescript',
    'Python': 'python',
    'Java': 'java',
    'Go': 'golang',
    'Rust': 'rust',
    'PHP': 'php',
    'Ruby': 'ruby',
    'C#': 'csharp',
    'C++': 'cpp',
    'C': 'c',
    'Swift': 'swift',
    'Kotlin': 'kotlin',
    'Dart': 'flutter',
    'Shell': 'linux',
    'HTML': 'html',
    'CSS': 'css',
    'Solidity': 'solidity',
}

// ─────────────────────────────────────────────────────
// normalizeTag
// takes a raw string and returns a normalized tag or null
// ─────────────────────────────────────────────────────
const normalizeTag = (raw) => {
    if (!raw || typeof raw !== 'string') return null
    const cleaned = raw.toLowerCase().trim()
    return TOPIC_MAP[cleaned] || null
    // returns null if we don't recognize the topic
    // we intentionally ignore unknown topics to keep skills clean
}

// ─────────────────────────────────────────────────────
// inferTags
// takes an array of repo objects from GitHub API
// returns a deduped array of skill tag strings
//
// each repo object expected shape:
// { name, language, topics: [], full_name }
// ─────────────────────────────────────────────────────
const inferTags = (repos) => {
    if (!repos || repos.length === 0) return []

    const tagSet = new Set()
    // ↑ Set automatically deduplicates — if react appears 10 times
    //   in different repos, it only ends up in the final list once

    repos.forEach(repo => {
        // 1. infer from primary language
        if (repo.language && LANGUAGE_MAP[repo.language]) {
            tagSet.add(LANGUAGE_MAP[repo.language])
        }

        // 2. infer from topics array
        if (Array.isArray(repo.topics)) {
            repo.topics.forEach(topic => {
                const tag = normalizeTag(topic)
                if (tag) tagSet.add(tag)
            })
        }
    })

    return Array.from(tagSet)
    // convert Set back to array for storage in MongoDB
}

// ─────────────────────────────────────────────────────
// buildSkillObjects
// takes the tag strings and wraps them in the skill schema shape
// { tag, level, inferredFrom }
// ─────────────────────────────────────────────────────
const buildSkillObjects = (repos) => {
    if (!repos || repos.length === 0) return []

    // build a map of tag → repos that contributed it
    const tagRepoMap = {}

    repos.forEach(repo => {
        const tagsFromThisRepo = []

        if (repo.language && LANGUAGE_MAP[repo.language]) {
            tagsFromThisRepo.push(LANGUAGE_MAP[repo.language])
        }

        if (Array.isArray(repo.topics)) {
            repo.topics.forEach(topic => {
                const tag = normalizeTag(topic)
                if (tag) tagsFromThisRepo.push(tag)
            })
        }

        tagsFromThisRepo.forEach(tag => {
            if (!tagRepoMap[tag]) tagRepoMap[tag] = []
            tagRepoMap[tag].push(repo.name)
        })
    })

    // convert map to skill objects array
    return Object.entries(tagRepoMap).map(([tag, repoNames]) => ({
        tag,
        level: 'intermediate',
        // ↑ we default to intermediate — we don't have enough signal
        //   to determine beginner vs advanced from GitHub data alone
        //   a future improvement could infer level from commit count per repo
        inferredFrom: [...new Set(repoNames)].slice(0, 5)
        // store up to 5 repo names that contributed this tag
        // deduplicated, sliced to keep the document small
    }))
}

export { inferTags, buildSkillObjects, normalizeTag, TOPIC_MAP, LANGUAGE_MAP }