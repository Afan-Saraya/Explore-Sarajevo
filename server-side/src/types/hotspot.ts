export interface HotspotBlock {
  id: string;
  image: File | string | null;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface HotspotBlockSet {
  id: string;
  styles: {
    blockBackground: string;
    titleColor: string;
    descriptionColor: string;
    buttonBackground: string;
    buttonTextColor: string;
  };
  blocks: HotspotBlock[];
}

export interface FooterIcon {
  id: string;
  name: string;
  url: string;
  iconImage: File | string | null;
}

export interface HotspotFooter {
  icons: FooterIcon[];
  styles: {
    footerBackground: string;
    iconColor: string;
    textColor: string;
  };
}

export interface EditorsPick {
  id: string;
  cardImage: File | string | null;
  titleBosnian: string;
  titleEnglish: string;
  teaserBosnian: string;
  teaserEnglish: string;
  link: string;
}

export interface DiscoveryPlace {
  id: string;
  placeImage: File | string | null;
  nameBosnian: string;
  nameEnglish: string;
  categoryBosnian: string;
  categoryEnglish: string;
  link: string;
}

export interface QuickFun {
  bannerImage: File | string | null;
  titleBosnian?: string;
  titleEnglish?: string;
  subtitleBosnian?: string;
  subtitleEnglish?: string;
  link?: string;
}

export interface Utilities {
  cityName?: string;
  baseCurrency?: string;
  timezone?: string;
  latitude?: string;
  longitude?: string;
  targetCurrencies?: string;
}
