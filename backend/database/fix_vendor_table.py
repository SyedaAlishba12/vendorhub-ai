from sqlalchemy import text

from database.connection import engine


def fix_vendor_table():
    print("Checking vendors table...")

    required_columns = {
        "user_id": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS user_id INTEGER
        """,

        "business_name": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS business_name VARCHAR(200)
        """,

        "business_email": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS business_email VARCHAR(200)
        """,

        "phone": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS phone VARCHAR(30)
        """,

        "address": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS address TEXT
        """,

        "city": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS city VARCHAR(100)
        """,

        "state": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS state VARCHAR(100)
        """,

        "country": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS country VARCHAR(100)
        """,

        "postal_code": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20)
        """,

        "business_type": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS business_type VARCHAR(100)
        """,

        "website": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS website VARCHAR(255)
        """,

        "description": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS description TEXT
        """,

        "logo": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS logo VARCHAR(255)
        """,

        "created_at": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE
            DEFAULT CURRENT_TIMESTAMP
        """,

        "updated_at": """
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE
            DEFAULT CURRENT_TIMESTAMP
        """,
    }

    with engine.begin() as connection:

        # Make sure the vendors table exists
        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS vendors (
                    id SERIAL PRIMARY KEY
                )
                """
            )
        )

        # Add missing columns
        for column_name, sql in required_columns.items():
            print(f"Checking {column_name}...")
            connection.execute(text(sql))

    print("Checking foreign key...")

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'vendors_user_id_fkey'
                    ) THEN

                        ALTER TABLE vendors
                        ADD CONSTRAINT vendors_user_id_fkey
                        FOREIGN KEY (user_id)
                        REFERENCES users(id);

                    END IF;
                END
                $$;
                """
            )
        )

    print("Checking unique constraint...")

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'vendors_user_id_key'
                    ) THEN

                        ALTER TABLE vendors
                        ADD CONSTRAINT vendors_user_id_key
                        UNIQUE (user_id);

                    END IF;
                END
                $$;
                """
            )
        )

    print()
    print("🎉 Vendor table updated successfully!")


if __name__ == "__main__":
    fix_vendor_table()