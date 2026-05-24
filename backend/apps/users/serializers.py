from rest_framework import serializers

from apps.master_data.serializers import BranchMinimalSerializer, CompanyMinimalSerializer, DepartmentMinimalSerializer

from .models import User, UserRole


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "email", "role", "avatar"]


class UserSerializer(serializers.ModelSerializer):
    company_detail = CompanyMinimalSerializer(source="company", read_only=True)
    branch_detail = BranchMinimalSerializer(source="branch", read_only=True)
    department_detail = DepartmentMinimalSerializer(source="department", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "role",
            "avatar",
            "phone",
            "company",
            "company_detail",
            "branch",
            "branch_detail",
            "department",
            "department_detail",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "full_name",
            "role",
            "phone",
            "company",
            "branch",
            "department",
            "password",
            "confirm_password",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name", "phone", "avatar", "company", "branch", "department", "role", "is_active"]

    def validate_role(self, value):
        request = self.context["request"]
        if value == UserRole.SUPER_ADMIN and not request.user.is_super_admin:
            raise serializers.ValidationError("Only super admins can assign the Super Admin role.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    confirm_new_password = serializers.CharField()

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_new_password"]:
            raise serializers.ValidationError({"confirm_new_password": "Passwords do not match."})
        return attrs
