import prisma from '../prisma';

export async function seedMockData(userId: string) {
	// Check if repositories already exist for this user
	const existing = await prisma.repository.findFirst({
		where: { userId }
	});

	if (existing) {
		return; // Already seeded
	}

	// 1. Create Svelte repository
	const svelteRepo = await prisma.repository.create({
		data: {
			name: 'sveltejs/svelte',
			url: 'https://github.com/sveltejs/svelte',
			isActive: true,
			userId,
			pullRequests: {
				create: [
					{
						number: 1421,
						title: 'feat: Add compiler optimizations for reactive arrays',
						branch: 'main',
						status: 'open',
						reviews: {
							create: [
								{
									score: 87,
									status: 'completed',
									summary: `### Executive Summary
The PR introduces a performance optimization for compiling reactive array mutations in Svelte 5. It minimizes DOM updates by analyzing nested array changes and compiling inline micro-updates rather than re-rendering the list.

### Key Changes
- **Ast Compiler Optimization**: Rewrites reactive array modifications (\`push\`, \`pop\`, \`splice\`) into specialized AST node operations.
- **Runtime Helper**: Adds a lightweight tracker for array indices.

### General Feedback
The overall architecture is highly performant. However, we found a critical issue in runtime array binding cleanups that can lead to memory leaks, and a few styling inconsistencies in compiler warnings.`,
									comments: {
										create: [
											{
												filePath: 'src/compiler/compile/nodes/Array.ts',
												lineNumber: 48,
												diffHunk: `@@ -45,7 +45,7 @@ export default class ReactiveArray extends Node {
-		const elements = this.expression.elements;
-		return elements.map(el => el.compile());
+		// Micro-optimization: cache length and loop backwards
+		const elements = this.expression.elements;
+		const len = elements.length;
+		const compiled = new Array(len);
+		for (let i = len - 1; i >= 0; i--) {
+			compiled[i] = elements[i].compile();
+		}
+		return compiled;`,
												content: `💡 **Suggestion**: Slicing AST elements in reverse order is a premature optimization in compiler pipelines. It reduces readability of node traversal without any measurable compilation speedup (as AST arrays are generally small, < 100 elements). 
Suggest keeping the cleaner \`elements.map(el => el.compile())\` structure unless benchmarks prove a significant bottleneck.`,
												type: 'suggestion'
											},
											{
												filePath: 'src/runtime/internal/arrays.ts',
												lineNumber: 104,
												diffHunk: `@@ -100,5 +100,5 @@ export function track_array(arr, callback) {
-	const unregister = active_effects.on_cleanup(() => remove_listener(arr, callback));
-	return unregister;
+	// Removed cleanup listener to save closure bytes
+	active_effects.on_cleanup(() => {});`,
												content: `⚠️ **Critical Issue**: Removing the cleanup callback leaves the mutation listener active on the array indefinitely. 
This will cause a **memory leak** every time components binding to this array are unmounted and remounted. You must restore the listener cleanup function.`,
												type: 'issue'
											}
										]
									}
								}
							]
						},
						chatMessages: {
							create: [
								{
									sender: 'ai',
									message: `🤖 **Rabbit AI Reviewer Initialized**

I have analyzed the diff of Pull Request **#1421**. I detected:
- **1 Critical Bug** (related to array effects cleanup and potential memory leaks)
- **1 Performance / Readability Suggestion** (in AST compilers)

You can ask me questions about this review or request changes directly in the chat below.`
								}
							]
						}
					},
					{
						number: 1422,
						title: 'docs: update migration guide for Svelte 5 runes',
						branch: 'docs-runes',
						status: 'merged',
						reviews: {
							create: [
								{
									score: 98,
									status: 'completed',
									summary: `### Executive Summary
This documentation PR updates the official migration guide to reflect the latest changes to Svelte 5 runes ($state, $derived, $effect).

### Feedback
The docs are crystal clear and contain helpful before/after examples. No structural errors found.`
								}
							]
						}
					}
				]
			}
		}
	});

	// 2. Create TensorFlow/JAX repo
	await prisma.repository.create({
		data: {
			name: 'google/jax',
			url: 'https://github.com/google/jax',
			isActive: true,
			userId,
			pullRequests: {
				create: [
					{
						number: 849,
						title: 'refactor: optimize autograd compile-time allocations',
						branch: 'main',
						status: 'open',
						reviews: {
							create: [
								{
									score: 93,
									status: 'completed',
									summary: `### Executive Summary
Refactors compilation layout buffers for JAX autograd equations to minimize memory allocations on XLA compile tasks.

### Feedback
Excellent implementation. Performance reports show a 4.2% drop in compiler execution time. We recommended a tiny adjustment to floating point precision guards.`,
									comments: {
										create: [
											{
												filePath: 'jax/_src/compiler/xla.py',
												lineNumber: 215,
												diffHunk: `@@ -210,6 +210,7 @@ def compile_autograd(eqn, shapes):
-  layout = xla_client.Layout.strides(shape)
+  # Bypass strides construction if already aligned
+  if shape.is_aligned: return shape
+  layout = xla_client.Layout.strides(shape)`,
												content: `✨ **Praise**: Good catch bypassing stride layout construction for pre-aligned buffers. This shaves off substantial metadata overhead during deep compilation graphs.`,
												type: 'praise'
											}
										]
									}
								}
							]
						}
					}
				]
			}
		}
	});
}
