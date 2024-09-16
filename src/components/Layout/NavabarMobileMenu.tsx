const NavabarMobileMenu = () => {
  return (
    <div className="dropdown dropdown-click">
      <div tabIndex={0} role="button" className="cursor-pointer">
        <img
          src='/logo_navbar.png'
          className='w-[80px] h-[20px] block md:hidden'
        />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu px-4 py-4 gap-3 shadow bg-main rounded-box w-[170px] border border-[#131519] left-0"
        style={{
          borderRadius: "12px",
          boxShadow: "0px 4px 10px 0px rgba(169, 211, 18, 0.5)",
        }}
      >
        <li className="hover:bg-[rgba(219, 243, 136, 0.5)] rounded-box relative">
          <a
            className="text-[#1D2F2F] text-[14px]"
            style={{ textIndent: "2.2em" }}
            href="/"
          >
            Home
          </a>
        </li>
        <div className="border border-[#1D2F2F]/50 w-[80%] mx-auto"></div>
        <li className="hover:bg-[rgba(219, 243, 136, 0.5)] rounded-box relative">
          <a
            className="text-[#1D2F2F] text-[14px]"
            style={{ textIndent: "2.2em" }}
            href="https://doc.metaid.io/"
            target="_blank"
          >
            Docs
          </a>
        </li>
        <div className="border border-[#1D2F2F]/50 w-[80%] mx-auto"></div>
        <li className="hover:bg-[rgba(219, 243, 136, 0.5)] rounded-box relative">
          <a
            className="text-[#1D2F2F] text-[14px]"
            style={{ textIndent: "2.1em" }}
            onClick={() => {
              const doc_modal = document.getElementById(
                "about_modal"
              ) as HTMLDialogElement;
              doc_modal.showModal();
            }}
          >
            About
          </a>
        </li>
      </ul>
    </div>
  );
};

export default NavabarMobileMenu;
