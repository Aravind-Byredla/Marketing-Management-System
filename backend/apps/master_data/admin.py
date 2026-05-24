from django.contrib import admin

from .models import Branch, Category, Company, Department, SubCategory


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "created_at"]
    search_fields = ["name"]
    list_filter = ["is_active"]


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ["name", "company", "location", "is_active"]
    list_filter = ["company", "is_active"]
    search_fields = ["name", "location"]


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["name", "company", "is_active"]
    list_filter = ["company", "is_active"]
    search_fields = ["name"]


class SubCategoryInline(admin.TabularInline):
    model = SubCategory
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "icon", "sort_order", "is_active"]
    inlines = [SubCategoryInline]
    search_fields = ["name"]


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "is_active", "sort_order"]
    list_filter = ["category", "is_active"]
    search_fields = ["name"]
