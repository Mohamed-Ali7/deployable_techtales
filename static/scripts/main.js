$(document).ready(function () {
  let refreshTokenAccessed = false;
  let originalRequest = null;
  $.ajaxSetup({
    statusCode: {
      401: function (xhr) {
        const error = xhr.responseJSON;
        if (error && error.message === 'JWT token has expired' && !refreshTokenAccessed) {
          const refreshToken = Cookies.get('refresh_token');
          refreshTokenAccessed = true;

          if (!refreshToken) {
            window.location = '/login';
            return;
          }

          $.ajax({
            type: 'GET',
            url: 'http://techtales.alxairbnb.tech/api/v1/auth/refresh',
            headers: {
              'Authorization': 'Bearer ' + refreshToken
            }
          }).done(function (data) {
            const newAccessToken = data.access_token;
            Cookies.set('access_token', newAccessToken, { 'expires': 10 });
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;
            $.ajax(originalRequest);
          }).fail(function (response) {
            if (response.responseJSON) {
              console.error(response.responseJSON.message);
            }

            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            window.location = '/login';
          });
        } else {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location = '/login'
        }
      },
      403: function (xhr) {
        alert(xhr.responseJSON.message)
        return;
      },
      404: function (xhr) {
        window.location = '/not_found'
      }
    },
    beforeSend: function (xhr, settings) {
      const accessToken = Cookies.get('access_token');
      if (accessToken && settings.url != 'http://techtales.alxairbnb.tech/api/v1/auth/refresh') {
        originalRequest = settings;
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      }
    }
  });
});
