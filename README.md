# Comercializadora El Vecino

**Comercializadora El Vecino** is a Django-based backend API for managing inventory, sales, and purchases for a small commercialization business. It provides a robust foundation for a complete ERP system.

## 🚀 Features

- **Django 5** Backend with **Django REST Framework**.
- **User Authentication**: Custom User model with email and optional phone login.
- **Permissions**: Integrated Role-Based Access Control (RBAC) with **django-guardian**.
- **Inventory Management**: Manage products with variants (color, size).
- **Sales & Purchases**: Track transactions with automatic stock adjustments.
- **File Management**: Secure file uploads using **Django Storages**.
- **PDF Generation**: Generate invoices and reports using **ReportLab**.
- **Automatic Documentation**: Interactive API documentation with **drf-yasg**.

## 🛠️ Tech Stack

- **Framework**: [Django 5](https://www.djangoproject.com/)
- **API**: [Django REST Framework](https://www.django-rest-framework.org/)
- **Database**: MySQL (via [PyMySQL](https://github.com/PyMySQL/PyMySQL))
- **Authentication**: [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- **File Storage**: [Django Storages](https://django-storages.readthedocs.io/)
- **Documentation**: [drf-yasg](https://drf-yasg.readthedocs.io/)
- **PDFs**: [ReportLab](https://www.reportlab.com/)
- **Permissions**: [django-guardian](https://django-guardian.readthedocs.io/)
- **Versioning**: [django-simple-history](https://django-simple-history.readthedocs.io/)

## 📂 Project Structure

The project follows a modular structure where the main application is split into several independent Django apps:

- `apps/users`: Authentication and User Management.
- `apps/products`: Product and Variant management.
- `apps/sales`: Sales management and Invoice generation.
- `apps/purchases`: Purchase management.
- `apps/files`: File handling and upload management.
- `config`: Core project settings and URLs.

## 🚀 Getting Started

### Prerequisites

- [Python 3.11+](https://www.python.org/downloads/)
- [pipenv](https://pipenv.pypa.io/en/latest/)
- [MySQL 8.0+](https://dev.mysql.com/downloads/)

### Installation

1.  **Clone the repository** (if not already done).

2.  **Navigate to the project directory**:
    ```bash
    cd Comercializadora_El_Vecino
    ```

3.  **Install dependencies**:
    ```bash
    pipenv install
    ```

4.  **Activate the virtual environment**:
    ```bash
    pipenv shell
    ```

5.  **Run database migrations**:
    ```bash
    python manage.py migrate
    ```

6.  **Create a superuser** (optional, for admin access):
    ```bash
    python manage.py createsuperuser
    ```

7.  **Start the server**:
    ```bash
    python manage.py runserver
    ```

The API will be available at `http://localhost:8000`.

## 📡 API Documentation

Interactive API documentation is available at:

- **Swagger UI**: `http://localhost:8000/swagger-ui/`
- **ReDoc**: `http://localhost:8000/redoc/`

## 🔐 Security

The application implements **Role-Based Access Control (RBAC)**. Ensure you configure permissions correctly after creating users.
