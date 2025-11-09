import AuthCard from "@/components/AuthCard";

const SignUpPage = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen w-full overflow-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center blur-xs scale-105 bg-no-repeat brightness-50"
        style={{
          backgroundImage: "url('/background.jpg')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <div className="relative z-10 p-2">
        <AuthCard isSignUp />
      </div>
    </div>
  );
};

export default SignUpPage;
