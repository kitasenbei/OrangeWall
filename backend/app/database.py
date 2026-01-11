import os
import boto3

AWS_REGION = os.getenv("AWS_REGION", "ap-northeast-1")

# Table names from environment
TASKS_TABLE = os.getenv("TASKS_TABLE", "orangewall-dev-tasks")
STATUSES_TABLE = os.getenv("STATUSES_TABLE", "orangewall-dev-statuses")
NOTES_TABLE = os.getenv("NOTES_TABLE", "orangewall-dev-notes")
NOTE_FOLDERS_TABLE = os.getenv("NOTE_FOLDERS_TABLE", "orangewall-dev-note_folders")
KANBAN_BOARDS_TABLE = os.getenv("KANBAN_BOARDS_TABLE", "orangewall-dev-kanban_boards")
KANBAN_COLUMNS_TABLE = os.getenv("KANBAN_COLUMNS_TABLE", "orangewall-dev-kanban_columns")
KANBAN_CARDS_TABLE = os.getenv("KANBAN_CARDS_TABLE", "orangewall-dev-kanban_cards")
CALENDAR_EVENTS_TABLE = os.getenv("CALENDAR_EVENTS_TABLE", "orangewall-dev-calendar_events")
ROUTINES_TABLE = os.getenv("ROUTINES_TABLE", "orangewall-dev-routines")
SCHEDULE_BLOCKS_TABLE = os.getenv("SCHEDULE_BLOCKS_TABLE", "orangewall-dev-schedule_blocks")
CONTACTS_TABLE = os.getenv("CONTACTS_TABLE", "orangewall-dev-contacts")
USER_PREFERENCES_TABLE = os.getenv("USER_PREFERENCES_TABLE", "orangewall-dev-user_preferences")
RECIPES_TABLE = os.getenv("RECIPES_TABLE", "orangewall-dev-recipes")

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)

# Table references
tasks_table = dynamodb.Table(TASKS_TABLE)
statuses_table = dynamodb.Table(STATUSES_TABLE)
notes_table = dynamodb.Table(NOTES_TABLE)
note_folders_table = dynamodb.Table(NOTE_FOLDERS_TABLE)
kanban_boards_table = dynamodb.Table(KANBAN_BOARDS_TABLE)
kanban_columns_table = dynamodb.Table(KANBAN_COLUMNS_TABLE)
kanban_cards_table = dynamodb.Table(KANBAN_CARDS_TABLE)
calendar_events_table = dynamodb.Table(CALENDAR_EVENTS_TABLE)
routines_table = dynamodb.Table(ROUTINES_TABLE)
schedule_blocks_table = dynamodb.Table(SCHEDULE_BLOCKS_TABLE)
contacts_table = dynamodb.Table(CONTACTS_TABLE)
user_preferences_table = dynamodb.Table(USER_PREFERENCES_TABLE)
recipes_table = dynamodb.Table(RECIPES_TABLE)
