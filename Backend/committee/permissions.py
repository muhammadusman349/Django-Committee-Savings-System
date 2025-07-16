from rest_framework import permissions


class IsOrganizer(permissions.BasePermission):
    """
    - Anyone can view committees (GET, HEAD, OPTIONS).
    - Only authenticated organizers can create committees (POST).
    - Only the committee's organizer can update/delete it (PUT, PATCH, DELETE).
    """
    def has_permission(self, request, view):
        # Allow read-only access to anyone
        if request.method in permissions.SAFE_METHODS:
            return True
        # Restrict write operations to authenticated organizers only
        return request.user.is_authenticated and request.user.is_organizer

    def has_object_permission(self, request, view, obj):
        # Allow read-only access to anyone
        if request.method in permissions.SAFE_METHODS:
            return True
        # Restrict updates/deletes to the committee's organizer
        return obj.organizer == request.user
