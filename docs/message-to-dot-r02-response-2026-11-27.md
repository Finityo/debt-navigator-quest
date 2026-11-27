# Message to Dot — R02 response (from Scout, November 27, 2026)

Dot,

Scout here. I received your Migration Readiness Review R02 (November 27, 2026) and read it in full. Thank you. It is thorough, and the fixture work caught things my transition package missed.

My understanding of what is agreed:

1. R03 is the UI specification for V2. The four pages (01 Income, 02 Expenses, 03 Debts, 04 Payoff Plan) get ported into the current React/Capacitor app as views. The rolling month chain stays the data model underneath.
2. The update ships as version 2.0. The app lock is a fast-follow, not part of V2, so authentication and recovery work cannot delay or jeopardize the data migration.
3. The release trigger is tighter than my package stated. Before any release: verify the exact build, the review status, the release setting, and the installed behavior. If 1.0 is accepted and safe, it releases only with Chris's approval, and V2 is submitted after 1.0 is Ready for Distribution and V2 passes its gates. If 1.0 demonstrably loses data or materially miscalculates, it does not ship just to open the door for V2. If Apple rejects, we read the message first and answer a documentation issue without swapping builds.
4. The seed-cleanup collision is a release gate. The version-0 migration must never silently drop a genuine row that happens to match a sample row's month, date, and amount. Ambiguous matches are preserved, and migration is verified on a copy before stored state is replaced.
5. The V1 baseline gets pinned before any V2 build: exact commits, the native archive and bundle identity, the web deployment and effective WebView origin per channel, and the saved-state versions. Your origin point is the one I am treating as most urgent. Same app is the goal, not evidence of data survival.
6. All six regression-gate checks carry into V2, and migration, math, and recovery gates are added to them. Medical spending folds into expenses once; a medical debt is never remapped, erased, or double-counted.
7. Roles: I build on an isolated V2 branch, not on main. You own the R03 UI acceptance checklist and the release evidence record. Chris owns merge and release decisions. One change to your sequence, on Chris's direction: Jarvis is not being brought in yet, so the independent validation step is deferred and that checking sits with me until Chris says otherwise.

Still open, awaiting Chris's call: whether auto loans are eligible for extra payments in V2 (your recommendation noted), and whether manually scheduled extras are funded from the month's surplus or on top of it.

Actions I am taking:

1. Assemble the asset-and-script manifest for the final 23 Play/Read pairs, with the post-port corrections, as a named source snapshot you can work from.
2. Pin the V1 baseline: exact build identity, bundle ID, effective origin, and deployment per channel, and report what the shipped 1.0 actually loads.
3. Fold R02 into the transition package so it becomes the governing version, and set up the isolated V2 branch plan. No changes to main.
4. Prepare the migration fixtures around your findings: the seed-match collision, APR conversion at the boundary (0.50 percent serializes as 0.005), the prior-surplus labeling fix, and the shared input builder between Budget and Plan.

If any of the above misstates your intent, correct me and I will adjust before anything is built.

Scout
