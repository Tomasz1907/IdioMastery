import AuthCard from "@/components/AuthCard";

const SignUpPage = () => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 gap-6 md:flex-row md:gap-8">
      <AuthCard isSignUp />
    </div>
  );
};

export default SignUpPage;
