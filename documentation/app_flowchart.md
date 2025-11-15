flowchart TD
  Start[User visits site] --> CheckAuth[Check Authentication]
  CheckAuth -->|Not Authenticated| SignIn[Redirect to Sign In]
  SignIn --> CheckAuth
  CheckAuth -->|Authenticated| CheckRole[Check User Role]
  CheckRole -->|Admin| AdminDashboard[Admin Panel]
  CheckRole -->|Participant| ParticipantDashboard[Participant Dashboard]
  AdminDashboard --> AdminParticipants[Manage Participants]
  AdminDashboard --> AdminNews[Manage News]
  AdminDashboard --> AdminCompanies[Manage Companies]
  AdminDashboard --> AdminTransactions[Manage Transactions]
  ParticipantDashboard --> Home[Dashboard Home]
  ParticipantDashboard --> Transactions[Transactions Page]
  ParticipantDashboard --> Portfolio[Portfolio Page]
  ParticipantDashboard --> OBSOverlay[OBS Live Overlay]
  AdminParticipants --> APIAdminParticipants[API Admin Participants]
  AdminNews --> APIAdminNews[API Admin News]
  AdminCompanies --> APIAdminCompanies[API Admin Companies]
  AdminTransactions --> APIAdminTransactions[API Admin Transactions]
  Home --> APINews[API Fetch News]
  Transactions --> APITransactions[API Transactions]
  Portfolio --> APIPortfolio[API Portfolio]
  OBSOverlay --> APISSE[API Live Stream]
  APIAdminParticipants --> ORM[Drizzle ORM]
  APIAdminNews --> ORM
  APIAdminCompanies --> ORM
  APIAdminTransactions --> ORM
  APINews --> ORM
  APITransactions --> ORM
  APIPortfolio --> ORM
  APISSE --> ORM
  ORM --> DB[PostgreSQL Database]