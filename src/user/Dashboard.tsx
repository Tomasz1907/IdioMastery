import { auth } from "@/FirebaseConfig";

const Dashboard = () => {
  const user = auth.currentUser;
  return <div>Welcome {user?.email}</div>;
};

export default Dashboard;
