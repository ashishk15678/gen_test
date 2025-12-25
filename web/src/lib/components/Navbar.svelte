<script>
  export let active = "home";
</script>

<nav class="fixed top-0 left-0 w-full z-50 glass-card !rounded-none !bg-background/80 !border-b !border-white/5 !p-4">
  <div class="max-w-7xl mx-auto flex justify-between items-center">
    <a href="/" class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
      Rabbit
    </a>
    
    <div class="hidden md:flex gap-8 items-center">
      <a href="/" class="text-sm font-medium hover:text-white transition-colors {active === 'home' ? 'text-white' : 'text-muted'}">Home</a>
      <a href="/dashboard" class="text-sm font-medium hover:text-white transition-colors {active === 'dashboard' ? 'text-white' : 'text-muted'}">Dashboard</a>
      <a href="/pricing" class="text-sm font-medium hover:text-white transition-colors text-muted">Pricing</a>
      
      <a href="/dashboard" class="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm">
        Get Started
      </a>
    </div>
  </div>
</nav>
