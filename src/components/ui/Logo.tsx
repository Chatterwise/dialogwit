import Logo_Full from "../../resources/chatterwise_logo.png";
import Logo_Mini from "../../resources/chatterwise_logo_mini.png";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export const Logo = ({ className = "" }: LogoProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img src={Logo_Full} alt="ChatterWise" className={className} />
    </div>
  );
};

export const LogoMini = ({ className = "" }: LogoProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img src={Logo_Mini} alt="ChatterWise" className={className} />
    </div>
  );
};
