/* global md5 */
import Ember from 'ember';
import ajax from 'ghost/utils/ajax';
import ValidationEngine from 'ghost/mixins/validation-engine';

var SetupTwoController = Ember.Controller.extend(ValidationEngine, {
    size: 90,
    blogTitle: null,
    name: null,
    email: '',
    password: null,
    image: null,
    submitting: false,

    gravatarUrl: Ember.computed('email', function () {
        var email = this.get('email'),
            size = this.get('size');

        return 'http://www.gravatar.com/avatar/' + md5(email) + '?s=' + size + '&d=blank';
    }),

    userImage: Ember.computed('gravatarUrl', function () {
        return this.get('image') || this.get('gravatarUrl');
    }),

    userImageBackground: Ember.computed('userImage', function () {
        return 'background-image: url(' + this.get('userImage') + ')';
    }),

    // ValidationEngine settings
    validationType: 'setup',

    actions: {
        setup: function () {
            var self = this,
                data = self.getProperties('blogTitle', 'name', 'email', 'password');

            self.notifications.closePassive();

            this.toggleProperty('submitting');
            this.validate({format: false}).then(function () {
                ajax({
                    url: self.get('ghostPaths.url').api('authentication', 'setup'),
                    type: 'POST',
                    data: {
                        setup: [{
                            name: data.name,
                            email: data.email,
                            password: data.password,
                            blogTitle: data.blogTitle
                        }]
                    }
                }).then(function () {
                    self.get('session').authenticate('simple-auth-authenticator:oauth2-password-grant', {
                        identification: self.get('email'),
                        password: self.get('password')
                    });
                }).catch(function (resp) {
                    self.toggleProperty('submitting');
                    self.notifications.showAPIError(resp);
                });
            }).catch(function (errors) {
                self.toggleProperty('submitting');
                self.notifications.showErrors(errors);
            });
        }
    }
});

export default SetupTwoController;
