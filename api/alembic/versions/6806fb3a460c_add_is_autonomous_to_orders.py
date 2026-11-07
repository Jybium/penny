"""add is_autonomous to orders

Revision ID: 6806fb3a460c
Revises: 59fee801640d
Create Date: 2026-11-02 21:20:18.389344

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6806fb3a460c'
down_revision: Union[str, Sequence[str], None] = '59fee801640d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_autonomous BOOLEAN NOT NULL DEFAULT false"
    )

def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TABLE orders DROP COLUMN IF EXISTS is_autonomous")
