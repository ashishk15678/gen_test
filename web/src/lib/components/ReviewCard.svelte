<script>
    export let prTitle;
    export let repoName;
    export let status = "pending"; // pending, success, failed
    export let summary;
    export let timeAgo;
</script>

<div class="bg-surface border border-white/5 rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group">
    <div class="flex justify-between items-start mb-3">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-mono text-muted">{repoName}</span>
                {#if status === 'success'}
                    <span class="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider">Reviewed</span>
                {:else if status === 'pending'}
                    <span class="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">Processing</span>
                {/if}
            </div>
            <h4 class="font-bold text-lg group-hover:text-primary transition-colors">{prTitle}</h4>
        </div>
        <span class="text-xs text-muted">{timeAgo}</span>
    </div>
    
    <p class="text-sm text-muted line-clamp-2">{summary}</p>
</div>
