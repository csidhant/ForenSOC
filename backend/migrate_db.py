import sqlite3
import os

db_path = "forensoc.db"

if not os.path.exists(db_path):
    print("Database not found.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def add_column(table, column, type):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {type}")
        print(f"Added {column} to {table}")
    except sqlite3.OperationalError:
        print(f"Column {column} already exists in {table}")

# Add columns to normalized_events
add_column("normalized_events", "source_country", "VARCHAR(100)")
add_column("normalized_events", "source_city", "VARCHAR(100)")
add_column("normalized_events", "source_lat", "FLOAT")
add_column("normalized_events", "source_lng", "FLOAT")

# Add columns to alerts
add_column("alerts", "source_country", "VARCHAR(100)")
add_column("alerts", "source_city", "VARCHAR(100)")
add_column("alerts", "source_lat", "FLOAT")
add_column("alerts", "source_lng", "FLOAT")

conn.commit()
conn.close()
print("Migration completed.")
