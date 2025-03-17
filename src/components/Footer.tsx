import { FaDiscord, FaDonate, FaGithub } from "react-icons/fa";
import "../style/footer.css";

export default function Footer() {
  return (
    <div className="footer">
      <div>
        developed by{" "}
        <a href="https://twitter.com/mahloola" className="link">
          mahloola
        </a>{" "}
        and{" "}
        <a href="https://twitter.com/FunOrange42" className="link">
          FunOrange
        </a>
      </div>
      <span>
        <a
          className="icon"
          href="https://github.com/mahloola/osrs-music"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub />
        </a>
        <a className="icon" href="https://discord.gg/7sB8fyUS9W">
          <FaDiscord />
        </a>
        <a className="icon" href="https://ko-fi.com/mahloola">
          <FaDonate />
        </a>
      </span>
    </div>
  );
}
