# Private fork integration with Harness 0.2.2-rc.1

The private candidate keeps account-owned file forwarding, authenticated
request headers, arbitrary-file downloads and native Connection admission.
The original checkout's untracked Finder files are not release inputs.

The sidechat model remains agent-owned: `agent.model.select` is its only
durable selection writer. The public, single-argument `installModelSelection`
still installs the agent-scoped pre-step switch notice. Both create and cold
resume must register it during setup. Four regression cases execute those
setups with and without presets; no second selection ref or explicit duplicate
`model/selection` append is introduced.

The real GUI mount exposed another rc.1 contract change: `agentTeam` now
publishes `{ enabled, tasks, failure? }`, with no `members` array. The adapter
reads enabled state and retains task/failure data. It builds the persistent
teammate strip from the root and continuable `subagentCatalog` entries.
One-shot children remain in the normal topology rather than being shown as
idle teammates after completion. The Host mutation guard uses
`agentTeams.isEnabled` with the exact live agent instead of the removed
`tryMembership`; cold, disabled and stale callers still fail before mutation.

The parent fork's optional boot animation masks onboarding controls.
The retention helper clicks the real New Session control and excludes the
brand button that also contains the version text. That brand control ignores
the click, so a generic first-button selector never opened session B.

The mount helper dismisses it through its supported Escape interaction before
clicking the existing onboarding buttons. Runtime-error, native-terminal,
tab-reload and state-isolation assertions remain enabled.

Cordis 4.1.0, include 1.1.0 and Schemastery 3.19 match the rc.1 dependency
cohort. The optional better-locale plugin still advertises its old 0.1 peer
ranges; that pre-existing third-party mismatch is recorded separately.

Upstream v0.30.1 replaces the settings-nav marker and CSS mask with the
shell slot `settings.section.icon`. The private package version stays
`0.30.0-dsh.20261104.1`; only the icon implementation and its regression
test come from that upstream fix.
