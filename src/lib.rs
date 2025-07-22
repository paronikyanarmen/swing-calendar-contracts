use near_sdk::json_types::U64;
use near_sdk::{log, near};

#[near(serializers = [json, borsh])]
#[derive(PartialEq, Debug)]
enum EventType {
    Class,
    Party,
}

#[near(serializers = [json, borsh])]
#[derive(PartialEq, Debug)]
enum EventLevel {
    Beginner,
    Intermediate,
    Advanced,
    Teacher,
}

#[near(serializers = [json, borsh])]
pub struct Event {
    id: u16,
    title: String,
    description: String,
    start_time: U64,
    end_time: U64,
    location: String,
    r#type: EventType,
    instructor: String,
    level: EventLevel,
}

#[near(serializers = [json, borsh])]
pub struct EventInput {
    title: String,
    description: String,
    start_time: U64,
    end_time: U64,
    location: String,
    r#type: EventType,
    instructor: String,
    level: EventLevel,
}

#[near(contract_state)]
pub struct Contract {
    greeting: String,
    events: Vec<Event>,
    next_event_id: u16,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            greeting: "Hello".to_string(),
            events: Vec::new(),
            next_event_id: 1,
        }
    }
}

#[near]
impl Contract {
    pub fn get_greeting(&self) -> String {
        self.greeting.clone()
    }

    pub fn set_greeting(&mut self, greeting: String) {
        log!("Saving greeting: {greeting}");
        self.greeting = greeting;
    }

    pub fn add_event(&mut self, event: EventInput) -> u16 {
        log!("Adding new event: {}", event.title);

        let new_event = Event {
            id: self.next_event_id,
            title: event.title,
            description: event.description,
            start_time: event.start_time,
            end_time: event.end_time,
            location: event.location,
            r#type: event.r#type,
            instructor: event.instructor,
            level: event.level,
        };

        self.next_event_id += 1;

        self.events.push(new_event);
        self.next_event_id - 1
    }

    pub fn get_events(&self) -> &Vec<Event> {
        &self.events
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_should_return_default_greeting_when_no_greeting_is_set() {
        let contract = Contract::default();
        assert_eq!(contract.get_greeting(), "Hello");
    }

    #[test]
    fn test_should_set_and_get_greeting_when_greeting_is_updated() {
        let mut contract = Contract::default();
        contract.set_greeting("howdy".to_string());
        assert_eq!(contract.get_greeting(), "howdy");
    }

    #[test]
    fn test_should_store_event_when_event_is_added() {
        let mut contract = Contract::default();
        let event = EventInput {
            title: "Test Event".to_string(),
            description: "Test Description".to_string(),
            start_time: U64::from(1000),
            end_time: U64::from(2000),
            location: "Test Location".to_string(),
            r#type: EventType::Class,
            instructor: "Test Instructor".to_string(),
            level: EventLevel::Beginner,
        };

        let result = contract.add_event(event);
        let events = contract.get_events();
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].title, "Test Event");
        assert_eq!(result, 1);
    }

    #[test]
    fn test_should_store_multiple_events_in_order_when_events_are_added() {
        let mut contract = Contract::default();
        let event1 = EventInput {
            title: "Event 1".to_string(),
            description: "First event".to_string(),
            start_time: U64::from(1000),
            end_time: U64::from(2000),
            location: "Location 1".to_string(),
            r#type: EventType::Class,
            instructor: "Instructor 1".to_string(),
            level: EventLevel::Beginner,
        };

        let event2 = EventInput {
            title: "Event 2".to_string(),
            description: "Second event".to_string(),
            start_time: U64::from(3000),
            end_time: U64::from(4000),
            location: "Location 2".to_string(),
            r#type: EventType::Party,
            instructor: "Instructor 2".to_string(),
            level: EventLevel::Intermediate,
        };

        let result1 = contract.add_event(event1);
        let result2 = contract.add_event(event2);

        let events = contract.get_events();
        assert_eq!(events.len(), 2);
        assert_eq!(events[0].title, "Event 1");
        assert_eq!(events[1].title, "Event 2");
        assert_eq!(result1, 1);
        assert_eq!(result2, 2);
    }
}
