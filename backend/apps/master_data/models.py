from django.db import models


class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to="company_logos/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "companies"
        ordering = ["name"]
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.name


class Branch(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="branches")
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "branches"
        ordering = ["name"]
        unique_together = ("company", "name")
        verbose_name_plural = "Branches"

    def __str__(self):
        return f"{self.company.name} — {self.name}"


class Department(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="departments")
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "departments"
        ordering = ["name"]
        unique_together = ("company", "name")

    def __str__(self):
        return f"{self.company.name} — {self.name}"


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    icon = models.CharField(max_length=100, blank=True, help_text="Lucide icon name")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "categories"
        ordering = ["sort_order", "name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="subcategories")
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "subcategories"
        ordering = ["sort_order", "name"]
        unique_together = ("category", "name")
        verbose_name_plural = "Sub Categories"

    def __str__(self):
        return f"{self.category.name} > {self.name}"
