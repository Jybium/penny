"""widen order_items product_description

Revision ID: 31bc53e1e846
Revises: 6806fb3a460c
Create Date: 2026-11-07 19:29:56.867478

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '31bc53e1e846'
down_revision: Union[str, Sequence[str], None] = '6806fb3a460c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "order_items",
        "product_description",
        existing_type=sa.String(length=50),
        type_=sa.Text(),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "order_items",
        "product_description",
        existing_type=sa.Text(),
        type_=sa.String(length=50),
        existing_nullable=False,
    )
