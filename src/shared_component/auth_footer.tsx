interface AuthFooterProps {
  text: string;
  linkText: string;
  href: string;
}

export default function AuthFooter({ text, linkText, href }: AuthFooterProps) {
  return (
    <p className="mt-10 text-center text-sm text-gray-400">
      {text}{' '}
      <a href={href} className="font-semibold text-gray-900 hover:text-black transition-colors">
        {linkText}
      </a>
    </p>
  );
}