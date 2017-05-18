[![OpenCollective](https://opencollective.com/octotree/backers/badge.svg)](#backers) 
[![OpenCollective](https://opencollective.com/octotree/sponsors/badge.svg)](#sponsors)

## Octoprime
Browser extension (Chrome, Firefox, Opera and Safari) to show a code tree on GitHub. Awesome for exploring project source without having to pull every single repository to your machine. Features:

* Easy-to-navigate code tree, just like in IDEs
* Fast browsing with pjax and Turbolinks
* Support private repositories (see [instructions](#access-token))
* Support GitHub Enterprise (Chrome and Opera only, see [instructions](#enterprise-urls))

__GitLab is no longer supported__:
As of version 2.1.0, Octoprime no longer supports GitLab. There are 2 reasons for this. First, GitLab has changed so much recently that it would take a lot of effort to keep Octotree up to date. Second, the GitLab team has [told me](https://github.com/adhityan/octotree/issues/265) they would build a tree feature in GitLab itself. I can't afford working on something knowing my effort will be irrelevant any time soon. That being said, if anyone wants to work on supporting the new GitLab, I'll gladly accept contributions to add back GitLab support.

![Octotree on GitHub](docs/chrome-github.png)


### Install on Chrome, Firefox and Opera
* Install Octoprime from [Chrome Web Store](https://chrome.google.com/webstore/detail/octotree/bkhaagjahfmjljalopjnoealnfndnagc), [Mozilla Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/octotree/) or [Opera Add-ons Store](https://addons.opera.com/en/extensions/details/octotree/)
* Navigate to any GitHub repository (or just refresh this page as an example)
* The code tree should show on the left-hand side of the screen

__Note__: to configure Octoprime for GitHub Enteprise, see [instructions](#enterprise-urls)

### Install on Safari

Octoprime is not available on the Safari gallery. Instead, you must use the prebuilt package or build one from source.

* Download the [Safari prebuilt package](https://github.com/adhityan/octotree/blob/master/dist/safari.safariextz?raw=true)
* Double-click or drag it to Safari

### Install from prebuilt packages (all browsers)

Prebuilt packages are available in the  [dist](https://github.com/adhityan/octotree/tree/master/dist) folder. For security reason, only download Octotree from this location.

__Note__: Firefox 43+ requires add-ons to be signed. Therefore, you should install Octotree from the Mozilla store. For some reason if you want to install the prebuilt package instead, you have to [disable sign-check](https://github.com/adhityan/octotree/issues/220#issuecomment-166012724).

## Settings
### Access Token

__Note for the paranoids (like me!)__: Octoprime stores access tokens in your browser local storage and never transmits it anywhere. If you want to verify, check out the source, starting with [this line](https://github.com/adhityan/octotree/blob/master/src/view.options.js#L77).

#### GitHub
Octoprime uses [GitHub API](https://developer.github.com/v3/) to retrieve repository metadata. By default, it makes unauthenticated requests to the GitHub API. However, there are two situations when requests must be authenticated:

* You access a private repository
* You exceed the [rate limit of unauthenticated requests](https://developer.github.com/v3/#rate-limiting)

When that happens, Octoprime will ask for your [GitHub personal access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use). If you don't already have one, [create one](https://github.com/settings/tokens/new), then copy and paste it into the textbox. Note that the minimal scopes that should be granted are `public_repo` and `repo` (if you need access to private repositories).

#### Bitbucket
Octoprime uses [Bitbucket API](https://confluence.atlassian.com/bitbucket/repositories-endpoint-1-0-296092719.html) to retrieve repository metadata. By defualt, Octotree will ask for your [Bitbucket App password](https://confluence.atlassian.com/bitbucket/app-passwords-828781300.html). If you don't already have one, [create one](https://bitbucket.org/account/admin/app-passwords) (the minimal requirement is `Repositories`'s `Read` permission), then copy and paste it into the textbox.

Note that Octoprime extract your username from your current page by default for calling Bitbucket API. If fail to extract, Octotree will ask you for a token update, then you just need to prepend your username to the token, separated by a colon, i.e. `USERNAME:TOKEN`.

### Enterprise URLs
By default, Octoprime only works on `github.com`. To support enterprise version (Chrome and Opera only), you must grant Octotree sufficient permissions. Follow these steps to do so:

* Go to any GitHub repo
* Open the Octoprime settings panel

![Settings](docs/settings.jpg)

* Fill in the GitHub Enterprise URLs textbox, _one URL per line_
* Click Save and accept the permission prompt
* Navigate to your GitHub Enterprise site
* You might be asked to create an [access token](#access-token)

### Others
* __Hotkeys__: Octoprime uses [keymaster](https://github.com/madrobby/keymaster) to register hotkeys. Checkout the [supported keys](https://github.com/madrobby/keymaster#supported-keys).
* __Remember sidebar visibility__: if checked, show or hide Octotree based on its last visibility.
* __Show in non-code pages__: if checked, allow Octotree to show in non-code pages such as Issues and Pull Requests.
* __Load entire tree at once__: if checked, load and render the entire code tree at once. To avoid long loading, this should be unchecked if you frequently work with very large repos.

## Credits
* [@adhityan](https://github.com/adhityan) from where this was originally forked from

