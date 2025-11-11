"use client";

import React from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo i opis */}
          <div className="col-span-1">
            <img
              src="/assets/logosaraya-1.png"
              alt="Saraya Logo"
              className="w-[18vh] mb-4"
            />
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Saraya Pametno Odabrano je platforma koja povezuje najbolje brendove, poslovnice i
              iskustva u Sarajevu — na jednom mjestu.
            </p>

            {/* Društvene mreže */}
            <div className="flex items-center gap-4 mt-5">
              <a
                href="https://www.facebook.com/sarayasolution/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/saraya_solutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@SarayaSolutions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://ba.linkedin.com/in/saraya-solutions-20917b27a"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigacija */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Istraži
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/explore" className="hover:text-gray-900 dark:hover:text-white">
                  Explore Sarajevo
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-gray-900 dark:hover:text-white">
                  Brendovi
                </Link>
              </li>
              <li>
                <Link href="/businesses" className="hover:text-gray-900 dark:hover:text-white">
                  Poslovnice
                </Link>
              </li>
              <li>
                <Link href="/featured" className="hover:text-gray-900 dark:hover:text-white">
                  Istaknuto
                </Link>
              </li>
            </ul>
          </div>

          {/* Pomoć */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Pomoć
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gray-900 dark:hover:text-white">
                  Česta pitanja
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-gray-900 dark:hover:text-white">
                  Podrška
                </Link>
              </li>
            </ul>
          </div>

          {/* Pravne informacije */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Pravno
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">
                  Politika privatnosti
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white">
                  Uslovi korištenja
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-gray-900 dark:hover:text-white">
                  Kolačići
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Donji red */}
        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <p>© 2025 Saraya Solutions. Sva prava zadržana.</p>
          <p className="mt-3 sm:mt-0">
            Dizajn & razvoj:{" "}
            <a
              href="https://sarayasolutions.com/"
              target="_blank"
              className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
            >
              Saraya Team
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
