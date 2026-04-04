export interface LinkProps {
  id: string;
  title: string;
  url: string;
  clickCount: number;
}

export const dummyLinks: LinkProps[] = [
  {
    id: "link-1",
    title: "인스타그램",
    url: "https://instagram.com",
    clickCount: 120,
  },
  {
    id: "link-2",
    title: "유튜브",
    url: "https://youtube.com",
    clickCount: 450,
  },
  {
    id: "link-3",
    title: "블로그",
    url: "https://velog.io",
    clickCount: 85,
  },
  {
    id: "link-4",
    title: "GitHub",
    url: "https://github.com",
    clickCount: 310,
  },
  {
    id: "link-5",
    title: "포트폴리오",
    url: "https://notion.so",
    clickCount: 20,
  },
];
