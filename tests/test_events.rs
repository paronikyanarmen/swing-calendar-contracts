use near_workspaces::types::NearToken;
use serde_json::json;

#[tokio::test]
async fn test_should_store_event_when_event_is_added() -> Result<(), Box<dyn std::error::Error>> {
    let contract_wasm = near_workspaces::compile_project("./").await?;
    let sandbox = near_workspaces::sandbox().await?;
    let contract = sandbox.dev_deploy(&contract_wasm).await?;

    let event = json!({
        "event": {
            "title": "Rust Workshop",
            "description": "Learn Rust programming",
            "start_time": "1000",
            "end_time": "2000",
            "location": "Virtual",
            "type": "Class",
            "instructor": "Alice",
            "level": "Beginner"
        }
    });

    let outcome = contract
        .call("add_event")
        .args_json(event)
        .max_gas()
        .deposit(NearToken::from_yoctonear(0))
        .transact()
        .await?;

    assert!(
        outcome.is_success(),
        "Failed to add event: {:#?}",
        outcome.into_result().unwrap_err()
    );

    let events_outcome = contract.view("get_events").args_json(json!({})).await?;
    let events: Vec<serde_json::Value> = events_outcome.json()?;
    assert_eq!(events.len(), 1);
    assert_eq!(events[0]["title"], "Rust Workshop");
    assert_eq!(events[0]["id"], 1);

    Ok(())
}

#[tokio::test]
async fn test_should_store_multiple_events_in_order_when_events_are_added(
) -> Result<(), Box<dyn std::error::Error>> {
    let contract_wasm = near_workspaces::compile_project("./").await?;
    let sandbox = near_workspaces::sandbox().await?;
    let contract = sandbox.dev_deploy(&contract_wasm).await?;

    let event1 = json!({
        "event": {
            "title": "Event 1",
            "description": "First event",
            "start_time": "1000",
            "end_time": "2000",
            "location": "Location 1",
            "type": "Class",
            "instructor": "Instructor 1",
            "level": "Beginner"
        }
    });

    let event2 = json!({
        "event": {
            "title": "Event 2",
            "description": "Second event",
            "start_time": "3000",
            "end_time": "4000",
            "location": "Location 2",
            "type": "Party",
            "instructor": "Instructor 2",
            "level": "Intermediate"
        }
    });

    let _ = contract
        .call("add_event")
        .args_json(event1)
        .max_gas()
        .deposit(NearToken::from_yoctonear(0))
        .transact()
        .await?;

    let _ = contract
        .call("add_event")
        .args_json(event2)
        .max_gas()
        .deposit(NearToken::from_yoctonear(0))
        .transact()
        .await?;

    let events_outcome = contract.view("get_events").args_json(json!({})).await?;
    let events: Vec<serde_json::Value> = events_outcome.json()?;
    assert_eq!(events.len(), 2);
    assert_eq!(events[0]["title"], "Event 1");
    assert_eq!(events[0]["id"], 1);
    assert_eq!(events[1]["title"], "Event 2");
    assert_eq!(events[1]["id"], 2);

    Ok(())
}
