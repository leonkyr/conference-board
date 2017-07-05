
doAuth = () =>
  Trello.authorize({
    name: ev.target.getAttribute('data-name') || 'Conference board',
    scope: { read: true, write: true },
    expiration: '1hour',
    interactive: true,
  })

showAuth = () => {
  $('#loading').hide()
  $('#trello_auth').show()
  $('#form').hide();
  $('#trello_auth').click(doAuth);
}

showForm = () => {
  $('#loading').hide()
  $('#trello_auth').hide();
  $('#form').show();

  $('#unauth').click(ev => {
    ev.preventDefault();
    sessionStorage.clear();
    showAuth();
  });

  $('#token').val(Trello.token())

  Trello.get('/member/me', {
      fields: 'username,fullName,avatarHash',
      organizations: 'all',
      organization_fields: 'displayName'
    },
    (member) => {
      $('#trello_name').text(`${member.fullName} (${member.username})`);
      $('#avatar').attr('src', `https://trello-avatars.s3.amazonaws.com/${member.avatarHash}/50.png`)
      $('#teams').html('<option>No team</option>');
      member.organizations.forEach(team =>
        $('#teams').append(`<option value="${team.id}">${team.displayName}</option>`)
      );
    },
    (err) => {
      if (err.status == 401) {
        $('#error').show().html('Your token has expired, please re-auth with Trello');
        Trello.deauthorize();
        showAuth()
      } else {
        $('#error').show().html('Unable to load teams from Trello. Please refresh to try again');
      }
    }
  )
}

$().ready(() => {
  Trello.authorize({ interactive: false });

  if (Trello.authorized()) {
    showForm()
  } else {
    showAuth()
  }
});