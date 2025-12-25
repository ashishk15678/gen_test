<script>
  import Navbar from '$lib/components/Navbar.svelte';
</script>

<svelte:head>
  <title>Rabbit | AI Code Reviews</title>
</svelte:head>

<Navbar active="home" />

<main class="pt-24 min-h-screen relative overflow-hidden">
  <!-- Background Glow -->
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

  <!-- Hero Section -->
  <section class="max-w-7xl mx-auto px-6 py-20 text-center animate-fade-in">
    <div class="inline-block px-4 py-1 mb-6 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-accent">
      ✨ Now with Advanced Context Awareness
    </div>
    
    <h1 class="text-5xl md:text-7xl font-bold leading-tight mb-8">
      Cut code review time <br/>
      <span class="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">in half.</span>
    </h1>
    
    <p class="text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
      Rabbit is an AI-first code review companion that catches bugs, suggests refactors, and explains complex generic code—instantly.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <button class="btn-primary">Start Free Trial</button>
      <button class="btn-secondary">View Demo</button>
    </div>
  </section>

  <!-- Feature Grid -->
  <section class="max-w-7xl mx-auto px-6 py-20 animate-slide-up" style="animation-delay: 0.2s;">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Feature 1 -->
      <div class="glass-card hover:border-primary/50 transition-colors group">
        <div class="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
          <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h3 class="text-xl font-bold mb-2">Instant Feedback</h3>
        <p class="text-muted">Get reviews in seconds, not hours. Catch bugs before they merge.</p>
      </div>

      <!-- Feature 2 -->
      <div class="glass-card hover:border-secondary/50 transition-colors group">
        <div class="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
          <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h3 class="text-xl font-bold mb-2">Line-by-Line Analysis</h3>
        <p class="text-muted">Detailed suggestions on exact lines of code with copy-paste fixes.</p>
      </div>

      <!-- Feature 3 -->
      <div class="glass-card hover:border-accent/50 transition-colors group">
        <div class="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
          <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        </div>
        <h3 class="text-xl font-bold mb-2">Context Aware</h3>
        <p class="text-muted">Understands your entire codebase, not just the diff.</p>
      </div>
    </div>
  </section>
</main>
