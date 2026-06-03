import os

from django.core.management.base import BaseCommand

from apps.users.models import User, UserRole


class Command(BaseCommand):
    help = "Create or update the admin superuser (idempotent). Reads credentials from env vars."

    def handle(self, *args, **options):
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@marketing.local")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "Admin@1234")
        full_name = os.environ.get("DJANGO_SUPERUSER_FULL_NAME", "Admin User")

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"full_name": full_name, "role": UserRole.SUPER_ADMIN},
        )

        # Always (re)apply the important fields so a stale/bad account is fixed.
        user.full_name = full_name
        user.role = UserRole.SUPER_ADMIN
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()

        status = "created" if created else "updated"
        self.stdout.write(self.style.SUCCESS(f"Admin {status}: {email}"))