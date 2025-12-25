<script>
    export let active = "dashboard";
</script>

<aside class="w-64 fixed left-0 top-0 h-screen bg-surface border-r border-white/5 pt-24 hidden md:block">
    <div class="px-6 space-y-2">
        <a href="/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors {active === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-muted'}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            Dashboard
        </a>
        <a href="/dashboard/repositories" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors {active === 'repos' ? 'bg-primary/10 text-primary' : 'text-muted'}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
            Repositories
        </a>
        <a href="/settings" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors {active === 'settings' ? 'bg-primary/10 text-primary' : 'text-muted'}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Settings
        </a>
    </div>
</aside>
