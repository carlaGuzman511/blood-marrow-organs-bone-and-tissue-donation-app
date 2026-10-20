# Security

## Secrets policy

- Never commit a real credential (connection strings, passwords, API keys, client secrets).
- API connection string: `ConnectionStrings__DonationAppContext` env var on Render; locally
  `appsettings.Development.json` points at a local Postgres, or use `dotnet user-secrets`.
- Web environment files (`organs-donations-app/src/environments/`) ship in the public JS bundle:
  public values only.
- CI (`.github/workflows/api-ci.yml`, job *Secret scan*) runs [gitleaks](https://github.com/gitleaks/gitleaks)
  over `api/` on every push/PR touching it and fails the build if a secret is found.
  Run it locally with `gitleaks dir api --redact`.

## Incident: Neon password in `appsettings*.json` (US-SEC-01, US-API-33)

The production Neon connection string (user + password) was committed in plain text in
`api/.../appsettings.json` and `appsettings.Development.json` (gitleaks finds it in commits
`d9e6a83`, `ce006e2` and `5520a9b`). It was removed from the files in `b90614f` on `feature/backend`.

The repository is public, so the password must be treated as compromised even after the fix.
Status checklist:

- [x] Remove the connection string from `appsettings.json` / `appsettings.Development.json`
      (`b90614f`); the API refuses to start without one instead of falling back to a secret.
- [x] CI secret scan so it can't be committed again (`api-ci.yml`).
- [ ] **Rotate the password in Neon** — Console → project → *Roles* → *Reset password* for the role
      in the old connection string. Until this is done, the leaked password still works.
- [ ] **Update Render** — API service → *Environment* → `ConnectionStrings__DonationAppContext`
      with the new password, then redeploy. If auth-server (Keycloak) uses the same Neon role, update
      its `KC_DB_PASSWORD` too (see auth-server `README.md`, US-AUTH-03).
- [ ] **Merge `feature/backend` into `main`** — `main` (the public default branch) still contains the
      connection string in the current files.
- [ ] Check the Neon logs for connections you don't recognize.
- [ ] Optional: purge the secret from git history (below).

### Purging the secret from history (optional, after rotating)

Rotation is what makes the leak harmless; purging only removes it from casual view. It rewrites
every commit hash, needs a force-push, and every collaborator must re-clone afterwards. GitHub
may keep cached views of old commits (contact GitHub Support to remove them).

```bash
# 1. Finish all open branches/PRs first; then work on a fresh mirror clone.
git clone --mirror https://github.com/carlaGuzman511/blood-marrow-organs-bone-and-tissue-donation-app.git repo.git
cd repo.git

# 2. replacements.txt — one line per leaked value:  <old-password>==>REDACTED
git filter-repo --replace-text ../replacements.txt     # https://github.com/newren/git-filter-repo

# 3. Verify, then publish.
gitleaks git --redact                                    # expect: no leaks found
git push --force --mirror
```

`mobile/.env` (Google Maps key) is still tracked; it is handled separately in US-SEC-04.
