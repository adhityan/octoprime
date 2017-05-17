class IssueView {
  constructor($dom, store, adapter) {
    this.store = store
    this.adapter = adapter
    this.$view = $dom.find('.octotree_issues_view')
    this.$panel = this.$view.find('.octotree_view_body')
      .on('click', '.issue_button_like', this._onLikeClick.bind(this))
      .on('click', '.issue_button_volunteer', this._onVolunteerClick.bind(this))
    this.$hideIssueLink = $dom.find('.octoprime_links_browse').click(this._hide.bind(this))
    this.$showIssueLink = $dom.find('.octoprime_links_contribute').click(this._show.bind(this))
  }

  _show() {
    this.$hideIssueLink.removeClass('octoprime_links_act')
    this.$showIssueLink.addClass('octoprime_links_act')
    $(this).trigger(EVENT.VIEW_READY)
  }

  _hide() {
    this.$showIssueLink.removeClass('octoprime_links_act')
    this.$hideIssueLink.addClass('octoprime_links_act')
    $(this).trigger(EVENT.VIEW_CLOSE)
  }

  _showHeader(repo) {
    const adapter = this.adapter

    this.$view.find('.octotree_view_header')
      .html(
        '<div class="octotree_header_repo">' +
        '<a href="/' + repo.username + '">' + repo.username +'</a>'  +
        ' / ' +
        '<a data-pjax href="/' + repo.username + '/' + repo.reponame + '">' + repo.reponame +'</a>' +
        '</div>' +
        '<div class="octotree_header_branch">' +
        "Issues" +
        '</div>'
      )
      .on('click', 'a[data-pjax]', function (event) {
        event.preventDefault()
        const href = $(this).attr('href'); /* a.href always return absolute URL, don't want that */
        const newTab = event.shiftKey || event.ctrlKey || event.metaKey
        newTab ? adapter.openInNewTab(href) : adapter.selectFile(href)
      })
  }

  load(repo, token) {
    this.repo = repo
    this.token = token
    this._showHeader(repo)

    this.adapter.loadIssues({repo, token}, (err, issues) => {
      if (err) {
        $(this).trigger(EVENT.FETCH_ERROR, [err])
      }
      else {
        let content = '<ul class=\'issues_list\'>'
        //console.log('here', issues)

        issues.forEach((item) => {
          content += '<li>'
                  +  this._issueHtml(item)
                  +  '</li>'
        })
        content += '</ul>'
        this.$panel.html(content)
      }
    })
  }

  _issueHtml(issue) {
    return '<div class=\'issue_entry\' data-id=\'' + issue.number + '\'>'
          +'<div class=\'issue_title\'>'
          +'<a href=\'' + issue.url + '\'>'
          +issue.title
          +'</a></div>'
          +'<div class=\'issue_buttons\'>'
          +'<div class=\'issue_button issue_button_like'
          + ((issue.reactions.user_reaction)?' issue_button_like_reacted':'')
          + '\' '
          + ((issue.reactions.user_reaction)?' data-reaction-id='+issue.reactions.user_reaction.id:'') + '>'
          +'<span class=\'issue_button_like_count_icon\'></span>'
          +'<span class=\'issue_button_counter issue_button_like_count\'>'
          + issue.reactions.positive +'</span>'
          +'</div>'
          +'<div class=\'issue_button issue_button_volunteer'
          + ((issue.is_user_assigned)?' issue_button_volunteer_reacted':'')
          + '\'>'
          +'<span class=\'issue_button_volunteer_count_icon\'></span>'
          +'<span class=\'issue_button_counter issue_button_volunteer_count\'>'
          + issue.assignees.length +'</span>'
          +'</div></div></div>';
  }

  _onLikeClick(event) {
    const $target = $(event.currentTarget)
    const $counter = $target.children('.issue_button_counter')
    const issueId = $target.closest('.issue_entry').data('id')
    const has_reacted = $target.hasClass('issue_button_like_reacted')
    let current_likes = parseInt($counter.text())

    if(has_reacted) {
      var reaction_id = $target.data('reaction-id')
      this.adapter.removeIssueReaction(issueId, reaction_id, {repo: this.repo, token: this.token}, (err, reaction) => {
        if(err) return console.log('Error', err)

        current_likes--
        $counter.text(current_likes)
        $target.removeClass('issue_button_like_reacted')
        $target.data('reaction-id', '')
      })
    }
    else {
      this.adapter.addIssueReaction(issueId, 'heart', {repo: this.repo, token: this.token}, (err, reaction) => {
        if(err) return console.log('Error', err)

        current_likes++
        $counter.text(current_likes)
        $target.addClass('issue_button_like_reacted')
        $target.data('reaction-id', reaction.id)
      })
    }
  }

  _onVolunteerClick(event) {
    const $target = $(event.currentTarget)
    const $counter = $target.children('.issue_button_counter')
    const issueId = $target.closest('.issue_entry').data('id')
    const has_reacted = $target.hasClass('issue_button_volunteer_reacted')
    let current_volunteers = parseInt($counter.text())

    if(has_reacted) {
      this.adapter.unAssignMeFromIssue(issueId, {repo: this.repo, token: this.token}, (err, reaction) => {
        if(err) return console.log('Error', err)

        current_volunteers--
        $counter.text(current_volunteers)
        $target.removeClass('issue_button_volunteer_reacted')
      })
    }
    else {
      this.adapter.assignMeToIssue(issueId, {repo: this.repo, token: this.token}, (err, reaction) => {
        if(err) return console.log('Error', err)

        current_volunteers++
        $counter.text(current_volunteers)
        $target.addClass('issue_button_volunteer_reacted')
      })
    }
  }
}
