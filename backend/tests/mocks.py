"""
Mock objects for testing.
"""
from unittest.mock import MagicMock

# Mock Redis client
class MockRedis:
    def __init__(self, *args, **kwargs):
        self.data = {}
        self.pubsub_channels = {}
    
    def set(self, key, value, *args, **kwargs):
        self.data[key] = value
        return True
        
    def get(self, key):
        return self.data.get(key)
        
    def delete(self, *keys):
        deleted = 0
        for key in keys:
            if key in self.data:
                del self.data[key]
                deleted += 1
        return deleted
    
    def pubsub(self):
        return MockPubSub(self)
        
    def publish(self, channel, message):
        if channel in self.pubsub_channels:
            for callback in self.pubsub_channels[channel]:
                callback(message)
        return 1

class MockPubSub:
    def __init__(self, redis_client):
        self.redis_client = redis_client
        self.subscribed_channels = set()
        self.callback = None
        
    def subscribe(self, *channels):
        for channel in channels:
            self.subscribed_channels.add(channel)
            if channel not in self.redis_client.pubsub_channels:
                self.redis_client.pubsub_channels[channel] = []
        
    def listen(self):
        # This would normally block and yield messages
        # For testing, we'll return a generator that yields nothing and then stops
        yield from []
        
    def close(self):
        self.subscribed_channels.clear()

# Mock Supabase client
class MockSupabase:
    def __init__(self):
        self.tables = {
            "projects": [],
            "runs": [],
            "schedules": [],
            "templates": [],
            "results": []
        }
        
    def table(self, name):
        return MockTable(self.tables.get(name, []))
        
    def rpc(self, *args, **kwargs):
        return MockRPC()

class MockTable:
    def __init__(self, data=None):
        self.data = data or []
        self._filters = []
        self._selected = "*"
        
    def select(self, fields="*"):
        self._selected = fields
        return self
        
    def insert(self, data):
        if isinstance(data, dict):
            # Add an ID if not present
            if "id" not in data:
                data["id"] = len(self.data) + 1
            self.data.append(data)
        else:
            # Handle list of dicts
            for item in data:
                if "id" not in item:
                    item["id"] = len(self.data) + 1
                self.data.append(item)
        return self
        
    def update(self, data):
        # This is a fake implementation that would apply the update
        # to matching rows (determined by filters)
        for item in self._filtered_data():
            for key, value in data.items():
                item[key] = value
        return self
        
    def delete(self):
        # This would delete rows matching the filters
        # For simplicity, we'll just return self
        return self
        
    def eq(self, field, value):
        self._filters.append({"field": field, "op": "eq", "value": value})
        return self
        
    def _filtered_data(self):
        # Apply filters to the data
        result = self.data
        for f in self._filters:
            if f["op"] == "eq":
                result = [item for item in result if item.get(f["field"]) == f["value"]]
        return result
        
    def execute(self):
        response = MagicMock()
        response.data = self._filtered_data()
        response.error = None
        self._filters = []  # Reset filters after execution
        return response

class MockRPC:
    def execute(self):
        response = MagicMock()
        response.data = {}
        response.error = None
        return response 