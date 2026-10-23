# HKU, A Life — GitHub Pages upload

This is the complete static game, including the society, case competition, arrival-order and interface updates published on 23 October 2026. No build, terminal, backend or API key is needed.

## Files to upload

Keep all of these files together at the top level of your GitHub repository:

- index.html — opens the website
- styles.css — visual design
- app.js — screens, buttons and browser saves
- business.js — programmes, societies, destinations and career data
- campus.js — memberships and case competitions
- data.js — activities and life events
- engine.js — simulation rules and progression
- README.md — this guide

## Publish by dragging files

1. Download and unzip hku-a-life-github.zip on your computer.
2. Sign in to GitHub. Create a repository named hku-a-life, or open an existing repository intended for this game. For GitHub Free, use a Public repository; this makes the source code and website public.
3. In the repository, choose Add file → Upload files. On an empty repository, use the uploading an existing file link instead.
4. Open the extracted folder. Select all eight files INSIDE it and drag them onto the upload area. Upload the files themselves, not the ZIP or the enclosing folder. index.html must be visible at the repository’s top level.
5. Enter a commit message such as “Upload HKU life simulator”, then choose Commit changes. Commit to main.
6. Open the repository’s Settings → Pages. Under Build and deployment, choose Source: Deploy from a branch.
7. Select Branch: main and Folder: / (root), then Save.
8. Wait for the deployment to finish. Return to Settings → Pages and open the URL GitHub displays. For a repository named hku-a-life, the usual address is https://YOUR-USERNAME.github.io/hku-a-life/.

## Updating the game later

Use Add file → Upload files again. Upload replacement files with the same names into the same top-level location and commit to main. GitHub Pages republishes that branch. Do not remove an older module unless the new version no longer uses it.

## If something looks wrong

- A 404 or the README appears instead of the game: confirm index.html is at the top level and Pages uses main / (root).
- A blank page or missing styling: check that all seven game files were uploaded together and their filenames were not changed.
- Recent changes are not visible: wait for the Pages deployment in Actions to finish, then refresh the page.
- Double-clicking index.html on your computer is not a reliable preview because the game uses JavaScript modules. Use the published GitHub Pages URL.

## Saves and privacy

Each player’s save stays in their own browser. There is no server or shared leaderboard. Saves on the previous ChatGPT-hosted address do not automatically transfer to GitHub Pages. Opening the site in another browser/device also starts a separate save. The game’s source package contains no player saves, hosting credentials or account information.

This is an independent, unofficial HKU-inspired game. Students, job openings, competition results and simulation probabilities are fictional. Sources and assumptions are available inside the game.

## GitHub documentation

- Upload files: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- Enable Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
