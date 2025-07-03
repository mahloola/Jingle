import { Link } from 'react-router-dom';
import { ASSETS } from '../../constants/assets';
import IconButton from './IconButton';

function HomeButton() {
  return (
    <Link to='/'>
      <IconButton img={ASSETS['home']} />
    </Link>
  );
}

export default HomeButton;
