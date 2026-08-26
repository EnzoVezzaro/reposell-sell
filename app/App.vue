<template>
  <main class="rs-shell">
    <!-- Hero -->
    <section class="rs-section rs-block-hero">
      <span class="rs-eyebrow">Direct sale</span>
      <h1 class="rs-title">{{ productName }}</h1>
      <p class="rs-subtitle">{{ description }}</p>
    </section>

    <!-- GitHub Auth — same pattern as listing detail -->
    <section class="rs-section rs-block-github">
      <div class="rs-card rs-gh-card">
        <h2 class="rs-gh-title">GitHub account</h2>

        <!-- Connected -->
        <div v-if="ghConnected && ghUser" class="rs-gh-connected">
          <span class="rs-gh-avatar">✓</span>
          <span class="rs-gh-user">@{{ ghUser.login }}</span>
          <button class="rs-gh-disconnect" @click="disconnectGithub">Disconnect</button>
        </div>

        <!-- Device code showing -->
        <div v-else-if="ghState === 'device' || ghState === 'polling'" class="rs-gh-device">
          <p class="rs-gh-instructions">
            Enter this code on GitHub:
            <strong class="rs-gh-code">{{ userCode }}</strong>
          </p>
          <p class="rs-gh-timer">{{ countdown }}s remaining</p>
        </div>

        <!-- Error -->
        <div v-else-if="ghState === 'error'" class="rs-gh-error-wrap">
          <p class="rs-gh-error">{{ ghError }}</p>
          <button class="rs-btn rs-btn--primary" @click="connectGithub">Try again</button>
        </div>

        <!-- Idle — show Connect button -->
        <div v-else>
          <p class="rs-gh-hint">Connect your GitHub account to buy and fork this repository.</p>
          <button class="rs-btn rs-btn--primary" @click="connectGithub">Connect GitHub</button>
        </div>
      </div>
    </section>

    <!-- Payment confirmed / Fork section -->
    <section v-if="hasSessionId" class="rs-section rs-block-fork">
      <div class="rs-card rs-fork-card">
        <h2 class="rs-fork-title" style="color:var(--ok)">✓ Payment confirmed</h2>

        <div v-if="forkState === 'forking'" class="rs-gh-device">
          <p class="rs-gh-instructions">Forking <strong>{{ owner }}/{{ repo }}</strong> to your GitHub...</p>
        </div>

        <div v-else-if="forkState === 'done'" class="rs-gh-connected">
          <span class="rs-gh-avatar" style="background:var(--ok)">✓</span>
          <span class="rs-gh-user">Fork created!</span>
          <a :href="forkUrl" target="_blank" rel="noopener" class="rs-btn">Open forked repository ↗</a>
        </div>

        <div v-else-if="forkState === 'error'" class="rs-gh-error-wrap">
          <p class="rs-gh-error">{{ forkError }}</p>
          <button class="rs-btn rs-btn--primary" @click="forkRepo">Try again</button>
        </div>

        <div v-else-if="ghConnected">
          <button class="rs-btn rs-btn--primary" @click="forkRepo">Fork {{ repo }} to your GitHub</button>
        </div>

        <div v-else>
          <p class="rs-gh-hint">Connect your GitHub account above to fork after payment.</p>
        </div>
      </div>
    </section>

    <!-- Releases -->
    <section class="rs-section rs-block-releases">
      <h2 class="rs-h2">Releases</h2>
      <p class="rs-subtitle">Each release carries its own price and verified payment link.</p>

      <div v-if="availableReleases.length > 0" class="rs-grid rs-grid--releases">
        <article v-for="release in availableReleases" :key="release.version" class="rs-card rs-release">
          <div class="rs-release-head">
            <span class="rs-release-version">Release {{ release.version }}</span>
            <span class="rs-meta">instant fork delivery</span>
          </div>
          <div class="rs-offers">
            <div v-for="offer in release.offers.filter(o => o.status === 'available' && o.paymentLink)" :key="offer.scheme" class="rs-offer">
              <div>
                <span class="rs-offer-name">{{ offer.name }}</span>
                <span class="rs-meta">{{ offer.billing === 'recurring' ? `per ${offer.interval || 'month'}` : 'one-time' }}{{ offer.seats ? ` · ${offer.seats} seats` : '' }}</span>
              </div>
              <div class="rs-release-side">
                <span class="rs-price">{{ money(offer.price, offer.currency) }}</span>
                <a v-if="ghConnected" class="rs-btn" :href="offer.paymentLink" rel="nofollow">Buy</a>
                <span v-else class="rs-btn rs-btn--disabled">Buy</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-if="blockedReleases.length > 0" class="rs-grid rs-grid--releases" style="margin-top:1rem">
        <article v-for="release in blockedReleases" :key="release.version" class="rs-card rs-release">
          <div>
            <div class="rs-release-version">Release {{ release.version }}</div>
            <div class="rs-meta">not currently purchasable</div>
          </div>
          <span class="rs-pill rs-pill--bad">blocked</span>
        </article>
      </div>

      <p v-if="releases.length === 0" class="rs-empty">No releases are currently available for purchase.</p>
    </section>

    <!-- Footer -->
    <footer class="rs-footer">
      <p>Powered by RepoSell — sell software from your own repository.</p>
    </footer>
  </main>
</template>

<script>
const GITHUB_CLIENT_ID = 'Iv23lidhennqrdpdFUAT'
const CORS_PROXY = 'https://corsproxy.io/?url='
const GH_TOKEN_KEY = 'rs-sell-gh-token'
const GH_USER_KEY = 'rs-sell-gh-user'

export default {
  data() {
    // Read embedded data
    let data = { productName: 'Repository', description: '', repository: '', releases: [] }
    try {
      const el = document.getElementById('reposell-data')
      if (el) data = JSON.parse(el.textContent)
    } catch {}

    const repoSlug = data.repository || ''
    const parts = repoSlug.split('/')
    const sid = new URLSearchParams(window.location.search).get('session_id')

    return {
      productName: data.productName || data.product?.name || 'Repository',
      description: data.description || data.product?.description || 'Buy directly from the source repository.',
      repository: repoSlug,
      owner: parts[0] || '',
      repo: parts[1] || '',
      releases: data.releases || [],
      hasSessionId: !!sid,

      // GitHub state
      ghState: 'idle',
      ghError: '',
      ghToken: '',
      ghUser: null,
      userCode: '',
      countdown: 0,
      pollTimer: null,
      pollDeadline: 0,

      // Fork state
      forkState: 'idle',
      forkError: '',
      forkUrl: '',
    }
  },

  computed: {
    ghConnected() { return this.ghState === 'connected' },
    availableReleases() { return this.releases.filter(r => r.status === 'available') },
    blockedReleases() { return this.releases.filter(r => r.status !== 'available') },
  },

  mounted() {
    // Restore session
    const token = sessionStorage.getItem(GH_TOKEN_KEY)
    const user = sessionStorage.getItem(GH_USER_KEY)
    if (token && user) {
      this.ghToken = token
      try {
        this.ghUser = JSON.parse(user)
        this.ghState = 'connected'
      } catch {}
    }

    // If returning from Stripe, auto-fork
    if (this.hasSessionId && this.ghConnected) {
      this.forkRepo()
    }
  },

  beforeUnmount() {
    if (this.pollTimer) clearInterval(this.pollTimer)
  },

  methods: {
    money(amount, currency) {
      if (amount == null) return ''
      return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency
    },

    proxyFetch(url, options) {
      return fetch(CORS_PROXY + encodeURIComponent(url), options)
    },

    // --- GitHub Device Flow (exact same as listing detail) ---

    async connectGithub() {
      this.ghState = 'device'
      this.ghError = ''

      try {
        const res = await this.proxyFetch('https://github.com/login/device/code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, scope: 'repo' }),
        })
        const data = await res.json()

        if (data.error) {
          this.ghState = 'error'
          this.ghError = data.error_description || 'GitHub rejected the request — try again.'
          return
        }

        this.userCode = data.user_code
        window.open(data.verification_uri, '_blank', 'noopener')
        this.startPolling(data.device_code, data.interval || 5, data.expires_in || 900)
      } catch {
        this.ghState = 'error'
        this.ghError = 'Could not reach GitHub — check your connection.'
      }
    },

    startPolling(code, interval, expiresIn) {
      this.countdown = expiresIn
      this.pollDeadline = Date.now() + expiresIn * 1000

      this.pollTimer = setInterval(() => {
        this.countdown = Math.max(0, Math.ceil((this.pollDeadline - Date.now()) / 1000))
        if (this.countdown <= 0) {
          this.stopPolling()
          this.ghState = 'error'
          this.ghError = 'Device code expired — try again.'
        }
      }, 1000)

      this.pollForToken(code, interval * 1000)
    },

    async pollForToken(code, intervalMs) {
      if (Date.now() >= this.pollDeadline) {
        this.stopPolling()
        this.ghState = 'error'
        this.ghError = 'Device code expired — try again.'
        return
      }

      await new Promise(r => setTimeout(r, intervalMs))

      try {
        const res = await this.proxyFetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            device_code: code,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          }),
        })
        const data = await res.json()

        if (data.access_token) {
          this.stopPolling()
          this.ghToken = data.access_token
          this.ghState = 'connected'

          try {
            const uRes = await fetch('https://api.github.com/user', {
              headers: { Authorization: `Bearer ${data.access_token}` },
            })
            if (uRes.ok) {
              this.ghUser = await uRes.json()
              sessionStorage.setItem(GH_TOKEN_KEY, data.access_token)
              sessionStorage.setItem(GH_USER_KEY, JSON.stringify(this.ghUser))
            }
          } catch {}

          // Auto-fork if returning from payment
          if (this.hasSessionId) this.forkRepo()
          return
        }

        if (data.error === 'authorization_pending') {
          this.pollForToken(code, intervalMs)
          return
        }

        if (data.error === 'slow_down') {
          this.pollForToken(code, intervalMs + 5000)
          return
        }

        this.stopPolling()
        this.ghState = 'error'
        this.ghError = data.error_description || 'Authorization failed — try again.'
      } catch {
        this.pollForToken(code, intervalMs)
      }
    },

    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },

    disconnectGithub() {
      this.stopPolling()
      sessionStorage.removeItem(GH_TOKEN_KEY)
      sessionStorage.removeItem(GH_USER_KEY)
      this.ghToken = ''
      this.ghUser = null
      this.ghState = 'idle'
    },

    // --- Fork (same as listing detail) ---

    async forkRepo() {
      if (!this.ghToken || !this.owner || !this.repo) return

      this.forkState = 'forking'
      this.forkError = ''

      try {
        const res = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/forks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.ghToken}`,
            Accept: 'application/vnd.github+json',
          },
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message || `Fork failed: HTTP ${res.status}`)
        }

        const fork = await res.json()
        this.forkState = 'done'
        this.forkUrl = fork.html_url
      } catch (e) {
        this.forkState = 'error'
        this.forkError = e.message || 'Fork failed'
      }
    },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300..800&family=Syne:wght@400..800&display=swap');

:root {
  --rs-bg: #0b0c10;
  --rs-surface: #14161d;
  --rs-ink: #e8eaf0;
  --rs-muted: #9aa1b2;
  --rs-accent: #f5d90a;
  --rs-accent-ink: #111111;
  --rs-line: #262a35;
  --ok: #4ade80;
  --bad: #f87171;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font: 16px/1.6 'Outfit', sans-serif; background: var(--rs-bg); color: var(--rs-ink); min-height: 100vh; }
.rs-shell { width: min(880px, 92vw); margin: 0 auto; padding: 3rem 0 4rem; }
.rs-section { padding: 1rem 0; }
.rs-eyebrow { display: inline-block; font-size: .75rem; letter-spacing: .14em; text-transform: uppercase; color: var(--rs-accent); border: 1px solid var(--rs-line); border-radius: 999px; padding: .25rem .8rem; background: var(--rs-surface); }
.rs-title { font-family: 'Syne', sans-serif; font-size: clamp(2rem, 5vw, 3.2rem); line-height: 1.1; margin: .9rem 0 .5rem; letter-spacing: -.02em; }
.rs-subtitle { color: var(--rs-muted); font-size: 1.05rem; max-width: 56ch; }
.rs-h2 { font-family: 'Syne', sans-serif; font-size: clamp(1.4rem, 3vw, 2rem); margin-bottom: 1.2rem; }
.rs-card { background: var(--rs-surface); border: 1px solid var(--rs-line); border-radius: 14px; padding: 1.3rem 1.4rem; }
.rs-grid { display: grid; gap: 1rem; }
.rs-grid--releases { grid-template-columns: 1fr; }
.rs-btn { display: inline-block; background: var(--rs-accent); color: var(--rs-accent-ink); font-weight: 700; text-decoration: none; border-radius: 10px; padding: .65rem 1.4rem; border: none; cursor: pointer; font-size: .9rem; transition: transform .15s ease; }
.rs-btn:hover { transform: translateY(-1px); }
.rs-btn--disabled { background: var(--rs-line); color: var(--rs-muted); pointer-events: none; opacity: .5; }
.rs-btn--primary { background: var(--rs-accent); color: var(--rs-accent-ink); }
.rs-meta { color: var(--rs-muted); font-size: .85rem; }
.rs-empty { color: var(--rs-muted); margin-top: 1rem; }
.rs-pill { font-size: .72rem; border-radius: 999px; padding: .15rem .6rem; border: 1px solid var(--rs-line); }
.rs-pill--bad { color: var(--bad); }
.rs-release { display: flex; flex-direction: column; gap: .9rem; }
.rs-release-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
.rs-release-version { font-weight: 600; }
.rs-offers { display: grid; gap: .7rem; }
.rs-offer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-top: 1px solid var(--rs-line); padding-top: .7rem; }
.rs-offer-name { font-weight: 600; display: block; }
.rs-release-side { display: flex; align-items: center; gap: 1rem; }
.rs-price { font-weight: 700; font-size: 1.15rem; white-space: nowrap; }
footer.rs-footer { border-top: 1px solid var(--rs-line); padding: 1.6rem 0; color: var(--rs-muted); font-size: .88rem; }

/* GitHub section — matches listing detail */
.rs-gh-card { background: var(--rs-surface); border-radius: 14px; padding: 1.3rem 1.4rem; }
.rs-gh-title { font-size: 1.1rem; font-weight: 600; margin-bottom: .8rem; border: none; padding: 0; }
.rs-gh-connected { display: flex; align-items: center; gap: .6rem; }
.rs-gh-avatar { display: inline-flex; align-items: center; justify-content: center; width: 1.6rem; height: 1.6rem; border-radius: 50%; background: #238636; color: white; font-size: .8rem; font-weight: 700; }
.rs-gh-user { font-weight: 600; }
.rs-gh-disconnect { margin-left: auto; background: none; border: none; color: var(--rs-muted); font-size: .82rem; cursor: pointer; text-decoration: underline; }
.rs-gh-device { text-align: center; }
.rs-gh-instructions { font-size: .92rem; color: var(--rs-ink); margin: 0 0 .4rem; }
.rs-gh-code { font-family: 'Geist Mono', monospace; font-size: 1.4rem; letter-spacing: .15em; color: var(--rs-accent); background: var(--rs-bg); padding: .3rem .8rem; border-radius: 6px; border: 1px dashed var(--rs-line); }
.rs-gh-timer { font-size: .82rem; color: var(--rs-muted); margin: 0; }
.rs-gh-hint { font-size: .92rem; color: var(--rs-muted); margin: 0 0 .8rem; }
.rs-gh-error { font-size: .92rem; color: var(--bad); margin: 0 0 .8rem; }
.rs-gh-error-wrap { }

/* Fork section */
.rs-fork-card { border: 2px solid var(--ok); }
.rs-fork-title { font-size: 1.1rem; font-weight: 600; margin-bottom: .8rem; border: none; padding: 0; }
</style>
