"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import BlogsDataJson from "../../../../data/blogs.json";
import { BlogsDataType } from "@/types";

const Blog = () => {
  const BlogsData: BlogsDataType = BlogsDataJson;
  const params = useParams();
  const blogId = params.id as string;
  const blogData = BlogsData.entries[blogId];

  if (!BlogsDataJson.ids.find((id) => id === blogId)) {
    return (
      <div className="flex-1 grid place-content-center">
        <h1 className="flex items-center gap-2">
          <span className="text-3xl">404 |</span>
          <span>This page could not be found.</span>
        </h1>
      </div>
    );
  }

  return (
    <section className="p-2">
      <div className=" w-full h-svh md:h-[75vh] mx-auto max-w-[650px] md:max-w-[1550px]  md:max-h-[1000px]">
        <figure className="relative h-full w-full  overflow-clip rounded-[8px]">
          <Image
            className="object-cover"
            src={BlogsData.entries[blogId].banner}
            alt={BlogsData.entries[blogId].banner_alt_text}
            fill
          />
          <div className="absolute bottom-0 min-h-[45%]  left-0 w-full p-2 md:p-4">
            <figcaption className="w-full h-full rounded-[8px] p-4 md:p-6">
              <div className="lg:max-w-[70%] h-full flex flex-col gap-4">
                <h3 className="text-xl md:text-2xl capitalize font-bold">
                  {BlogsData.entries[blogId].name}
                </h3>
                <p className="max-[359px]:hidden">
                  {BlogsData.entries[blogId].description}
                </p>
                <div className="flex gap-4">
                  {blogData.tags.map((tag) => (
                    <p
                      key={tag}
                      className="border border-current px-2 p-1 text-sm min-w-[5rem] text-center rounded-full w-fit"
                    >
                      {tag}
                    </p>
                  ))}
                </div>
              </div>
            </figcaption>
          </div>
        </figure>
      </div>

      <article className="md:container px-4 mx-auto my-16 flex gap-4 relative">
        <div className="lg:w-[75%] max-w-[900px] flex flex-col gap-8 text-sm md:text-base md:text-justify">
          <p
            id={blogData.intro.section_id}
            className="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-1"
          >
            {blogData.intro.text}
          </p>
          {blogData.sections.map((section) => (
            <BlogSection
              sectionId={section.section_id}
              img={section.image}
              heading={section.heading}
              img_alt={section.image_alt_text}
              text={section.text}
              key={section.section_id}
            />
          ))}
        </div>
        <div className="px-16 hidden md:flex flex-col gap-4 sticky  h-fit top-7">
          <a href={`#${blogData.intro.section_id}`} className="capitalize">
            {blogData.intro.heading}
          </a>
          {blogData.sections.map((section) => (
            <a
              href={`#${section.section_id}`}
              key={section.section_id}
              className="capitalize"
            >
              {section.heading}
            </a>
          ))}
        </div>
      </article>
    </section>
  );
};

export default Blog;

type BlogSectionProp = {
  text: string;
  img: string;
  img_alt: string;
  heading: string;
  sectionId: string;
};
const BlogSection = ({
  heading,
  img,
  img_alt,
  text,
  sectionId,
}: BlogSectionProp) => {
  return (
    <div id={sectionId} className="flex flex-col gap-8">
      {heading && <h2 className="text-3xl capitalize">{heading}</h2>}
      {img && (
        <div className="relative w-full max-w-[500px] h-[350px]">
          <Image src={img} alt={img_alt} className="rounded-[4px]" fill />
        </div>
      )}
      <p>{text}</p>
    </div>
  );
};
