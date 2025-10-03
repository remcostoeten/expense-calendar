## Todo's

### Data
- [ ] Migrate data layer to use graphql (apollo? gql??)
    - [ ] Need swr or react query for client??
    - [ ] Look into codegen for graphql
- [ ] remove outlook,gmail, apple integration or fix oauth 

### Commute 

- [x] post authentication have a onboarding flow 
- [ ] allow modifying the onboarding flow in user profile settings 
- [ ] allow setting additional home adres | full CRUD
- [ ] allow setting additional work adres | full CRUD 
- [ ] allow linking home and work adreses to create a round trip with calc via google api.

### visualize
- [ ] have a visualization of the trip with intearctive map vai (already existing) google api

### ai
- [ ] gemini usecase    
- [ ] build system to rotate api keys so we dont run out of requests e.g.:

```env
GEMINI_API_KEY=x
GEMINI_API_KEY_TWO=x
GEMINI_API_KEY_THREE=x
```

### Calendar
- [ ] Allow event creation with clicking on the calendar

#### Creation 
- [ ] Allow event creation with dragging on the calendar in x axis (multiple hours)
- [ ] Allow event creation with dragging on the calendar in y axis (multiple days)

#### Updating
- [ ] Allow updating the via draggin the edges in x and y 
- [ ] allow updating the event via clicking on the event in the modal

#### Destory
- [ ] have a destroy (soft delete?????) in the modal
- [ ] creat a generic useDestroy which uses destroy-action, which uses server fnc destroy-crud.ts ( doesnt exist yet)

### Hooks 
- Create a useCRUD 
OR 
- Create useCreate
- create useDestroy
- create useUpdate
- create useGet || useRead

- [ ] have a standardized way of doing mutations/posts via `useTransition()` and `useOptimistic()`


