# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.contenttypes.models import ContentType


class NotificationManager(models.Manager):

    def create(self, created_user, text, about, source, ensure_for_objs=None):
        """Creates a notification.
        
        :param created_user: the user document who created the notification.
        :param text: the text of the notification
        :param obj: the document this notification is for.
        :param source: the source of the notifications. Can be one of 
            NotificationSource values.
        :param ensure_for_objs: list of object to ensure will receive the 
            notification.
        :return: if notification is successfully added this returns True.  
            Doesn't return entire object because the could potentially be a ton
            of notifications and I won't want to return all of them.
        
        """
        n = super(NotificationManager, self).create(text=text.strip(),
                                                    about=about,
                                                    created=created_user,
                                                    last_modified=created_user,
                                                    source=source)

        for_objs = [about, created_user]

        if ensure_for_objs:
            if not isinstance(ensure_for_objs, (list, tuple)):
                ensure_for_objs = [ensure_for_objs]

            for_objs += ensure_for_objs

        for_model = self.model._get_many_to_many_model(field_name='for_objs')

        # This is a bit annoying.  So I have to loop through these 1 by 1 instead
        # of using the bulk_create from the object manager because the bulk_create
        # statement doesn't return primary keys which is needed for for_objs
        # related manager add function call. See:
        # https://code.djangoproject.com/ticket/19527
        for_objs = [for_model.objects.get_or_create_generic(obj=obj)[0]
                    for obj in set(for_objs)]

        # for_objs = NotificationFor.objects.bulk_create(for_objs)
        n.for_objs.add(*for_objs)
        return n

    def get_by_user(self, user, **kwargs):
        """Gets notifications for a user.

        :param user: the user to get the notifications for

        """
        return self.get_by_object(obj=user, **kwargs)

    def get_by_object(self, obj, **kwargs):
        """Gets notifications for a specific object.
        
        :param obj: the object the notifications are for
        :param kwargs: any key value pair fields that are on the model.
        
        """
        content_type = ContentType.objects.get_for_model(obj)
        return self.filter(for_objs__content_type=content_type,
                           for_objs__object_id=obj.id,
                           **kwargs)


class NotificationForManager(models.Manager):

    def get_or_create_generic(self, obj, **kwargs):
        """Gets or creates a generic object.  This is a wrapper for 
        get_or_create(...) when you need to get or create a generic object.
        
        :param obj: the object to get or create
        :param kwargs: any other kwargs that the model accepts.
        """
        content_type = ContentType.objects.get_for_model(obj)
        return self.get_or_create(content_type=content_type,
                                  object_id=obj.id,
                                  **kwargs)

    def get_by_content_type(self, content_type):
        """Gets all objects by a content type."""
        return self.filter(content_type=content_type)

    def get_by_model(self, model):
        """Gets all object by a specific model."""
        content_type = ContentType.objects.get_for_model(model)
        return self.filter(content_type=content_type)


class NotificationReplyManager(models.Manager):

    def create(self, created, notification, text, reply_to_id=None,
               **kwargs):
        """Creates a new notification reply.
        
        :param created: the user creating the reply.
        :param notification: the notification this reply is about.
        :param text: the text of the notification.
        :param reply_to_id: the id of the reply this reply is about.
        """
        return super(NotificationReplyManager, self).create(created=created,
                                                            text=text,
                                                            notification=notification,
                                                            reply_to_id=reply_to_id,
                                                            **kwargs)

    def get_by_notification(self, notification):
        """Gets all objects for a notification object."""
        try:
            return self.get(notification=notification)
        except self.model.DoesNotExist:
            return None

    def get_by_notification_id(self, notification_id):
        """Gets all objects by notification id."""
        try:
            return self.get(notification_id=notification_id)
        except self.model.DoesNotExist:
            return None
