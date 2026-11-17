// Home page — rendered at the site root URL (/)
import Link from 'next/link';
import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import { getSortedList } from '../lib/data';

export async function getStaticProps() {
  const allPostsData = await getSortedList();
  return {
    props: {
      allPostsData,
    },
  };
}

function ItemList({ items }) {
  if (!items.length) {
    return <p>No items yet.</p>;
  }

  return (
    <ul className={utilStyles.list}>
      {items.map(({ id, name }) => (
        <li className={utilStyles.listItem} key={id}>
          <Link href={`/posts/${id}`}>{name}</Link>
        </li>
      ))}
    </ul>
  );
}

export default function Home({ allPostsData }) {
  const posts = allPostsData.filter((item) => item.type === 'post');
  const games = allPostsData.filter((item) => item.type === 'game');
  const consoles = allPostsData.filter((item) => item.type === 'console');

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ItemList items={posts} />
      </section>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Games</h2>
        <ItemList items={games} />
      </section>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Consoles</h2>
        <ItemList items={consoles} />
      </section>
    </Layout>
  );
}
