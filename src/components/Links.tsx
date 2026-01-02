import { FaDiscord, FaDonate, FaGithub } from 'react-icons/fa';
import '../style/mainMenu.css';
const Links = () => {
  return (
    <div className='main-menu-icon-container'>
      <a
        className='main-menu-icon'
        href='https://github.com/mahloola/osrs-music'
        target='_blank'
        rel='noopener noreferrer'
      >
        <FaGithub />
      </a>
      <a
        className='main-menu-icon'
        href='https://discord.gg/7sB8fyUS9W'
      >
        <FaDiscord />
      </a>
      <a
        className='main-menu-icon'
        href='https://ko-fi.com/mahloola'
      >
        <FaDonate />
      </a>
    </div>
  );
};

export default Links;
