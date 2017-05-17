class IssueView {
  constructor($dom, store, adapter) {
    this.store = store
    this.adapter = adapter
    this.$view = $dom.find('.octotree_issues_view')
    this.$panel = this.$view.find('.octotree_view_body')
      .on('click', '.issue_button_like', this._onLikeClick.bind(this))
      .on('click', '.issue_button_volunteer', this._onVolunteerClick.bind(this))
      .on('click', '.issue-anchor', this._onIssueClick.bind(this))
      .on('click', '.issues_add_panel_submit', this._addNewIssue.bind(this))
      .on('input', '.issues_add_panel_text', this._newIssueTextChange.bind(this))
    this.$hideIssueLink = $dom.find('.octoprime_links_browse').click(this._hide.bind(this))
    this.$showIssueLink = $dom.find('.octoprime_links_contribute').click(this._show.bind(this))
    this.$contributeCounter = $dom.find('.octoprime_links_contribute_counter').click(this._show.bind(this))
    this.$contributeCounter.hide()
    this.shown = false
  }

  _show() {
    this.shown = true
    this.$hideIssueLink.removeClass('octoprime_links_act')
    this.$showIssueLink.addClass('octoprime_links_act')
    $(this).trigger(EVENT.VIEW_READY)
  }

  _hide() {
    this.shown = false
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
      if (err) $(this).trigger(EVENT.FETCH_ERROR, [err])
      else {
        issues = this._sort(issues)
        this.$contributeCounter.text(issues.length)
        this.$contributeCounter.show()

        let content = '<ul class=\'issues_list\'>'
        //console.log('here', issues)

        issues.forEach((item) => {
          content += this._issueHtml(item)

        })
        content += '</ul>'
                +  '<div class=\'issues_add_panel\'>'
                +  '<input type=\'text\' class=\'issues_add_panel_text\' />'
                +  '<button disabled class=\'issues_add_panel_submit\'>Submit</button>'
                +  '</div>'
        this.$panel.html(content)
        if(this.shown) this._show()
      }
    })
  }

  _sort(issues) {
    return issues.sort((a, b) => {
      //console.log(a.title, b.title, a.reactions.positive, b.reactions.positive, a.help_wanted, b.help_wanted)
      if(a.reactions.positive > b.reactions.positive) return -1
      else if(a.reactions.positive < b.reactions.positive) return 1
      else if(a.help_wanted && !b.help_wanted) return -1
      else if(!a.help_wanted && b.help_wanted) return 1
      else if(a.reactions.positive === b.reactions.positive) return -1
      else return 1
    })
  }

  _issueHtml(issue) {
    return '<li class=\''
          +((issue.help_wanted)?'issue_help_wanted':'')
          +'\'><div class=\'issue_entry\' data-id=\'' + issue.number + '\'>'
          +'<div class=\'issue_title\'>'
          +'<a class=\'issue-anchor\' data-href=\'' + issue.html_url + '\'>'
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
          +'</div></div></div></li>';
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

  _onIssueClick(event) {
    const $target = $(event.currentTarget)
    if (!$target.is('a.issue-anchor')) return

    // handle middle click
    if (event.which === 2) return

    // refocus after complete so that keyboard navigation works, fix #158
    const refocusAfterCompletion = () => {
      $(document).one('pjax:success page:load', () => {
        this.$panel.focus()
      })
    }

    const adapter = this.adapter
    const newTab = event.shiftKey || event.ctrlKey || event.metaKey
    const href = $target.data('href')

    refocusAfterCompletion()
    newTab ? adapter.openInNewTab(href) : adapter.selectFile(href)
  }

  _newIssueTextChange(event) {
    const $target = $(event.currentTarget)
    const $button = $target.parent().children('.issues_add_panel_submit')

    if($target.val().length > 0) $button.attr('disabled', false)
    else $button.attr('disabled', true)
  }

  _addNewIssue(event) {
    const $target = $(event.currentTarget)
    const $textfield = $target.parent().children('.issues_add_panel_text')
    $target.attr('disabled', true)

    this.adapter.addIssue($textfield.val(), {repo: this.repo, token: this.token}, (err, issue) => {
      if (err) {
        $target.attr('disabled', false)
        return
      }

      const content = this._issueHtml(issue)
      this.$panel.find('.issues_list').append(content)
      $textfield.val('')

      this.$contributeCounter.text(parseInt(this.$contributeCounter.text()) + 1)
    })
  }

  syncSelection() {
    this.adapter.loadIssues({repo: this.repo, token: this.token}, (err, issues) => {
      if (!err) {
        issues = this._sort(issues)
        this.$contributeCounter.text(issues.length)

        let content = '<ul class=\'issues_list\'>'
        //console.log('here', issues)

        issues.forEach((item) => {
          content += this._issueHtml(item)
        })

        content += '</ul>'
          +  '<div class=\'issues_add_panel\'>'
          +  '<input type=\'text\' class=\'issues_add_panel_text\' />'
          +  '<button disabled class=\'issues_add_panel_submit\'>Submit</button>'
          +  '</div>'
        this.$panel.html(content)
      }
    })
  }
}
