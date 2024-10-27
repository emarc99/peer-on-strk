import Image from "next/image";
import Link from "next/link";
import BlogsDataJson from "../../data/blogs.json";
import { BlogsDataType } from "@/types";
import { ArrowUpRight } from "lucide-react";
const BlogsData: BlogsDataType = BlogsDataJson;

const Blogs = () => {
  const featuredId = "ppb5";
  return (
    <section className="flex-1 px-2 md:px-8">
      <div className=" w-full h-[75vh] mx-auto max-w-[650px] md:max-w-[1550px] max-h-[400px] md:max-h-[1000px]">
        <Link
          href={`/blog/${BlogsData.entries[featuredId].name
            .toLocaleLowerCase()
            .split(" ")
            .join("-")}/${featuredId}`}
        >
          <figure className="relative h-full w-full cursor-pointer overflow-clip rounded-[8px] group">
            <Image
              className="md:object-cover transition-all duration-500 group-hover:scale-105"
              src={BlogsData.entries[featuredId].banner}
              alt=""
              fill
            />
            <div className="absolute bottom-0 h-[45%]  left-0 w-full p-2 md:p-4">
              <figcaption className="w-full h-full rounded-[8px]  backdrop-blur-lg border border-[#ffffff76] p-4 md:p-6">
                <div className="max-w-[80%] lg:max-w-[70%] h-full flex flex-col gap-4">
                  <p className="font-bold">Featured</p>
                  <h3 className="text-lg md:text-2xl capitalize font-bold line-clamp-2">
                    {BlogsData.entries[featuredId].name}
                  </h3>
                  <p className="line-clamp-1 md:line-clamp-3">
                    {BlogsData.entries[featuredId].description}
                  </p>
                </div>
              </figcaption>
            </div>
          </figure>
        </Link>
      </div>
      <div className="md:container w-full grid md:grid-cols-2 lg:grid-cols-3 gap-4 my-8 md:my-16 mx-auto">
        {BlogsData.ids.map((id) => {
          const entry = BlogsData.entries[id];
          return (
            <BlogLink
              key={id}
              id={id}
              name={entry.name}
              description={entry.short_description}
              alt={entry.banner_alt_text}
              createdAt={entry.created_at}
              image={entry.banner}
            />
          );
        })}
      </div>
    </section>
  );
};

export default Blogs;

type BlogLinkProps = {
  name: string;
  image: string;
  description: string;
  createdAt: string;
  alt: string;
  id: string;
};

const BlogLink = ({
  alt,
  createdAt,
  description,
  image,
  name,
  id,
}: BlogLinkProps) => {
  return (
    <Link
      href={`/blog/${name.toLocaleLowerCase().split(" ").join("-")}/${id}`}
      className="w-full mx-auto max-w-[500px] h-[400px] group"
    >
      <div className="relative overflow-clip rounded-[8px] h-[60%]">
        <Image
          className="object-cover rounded-[8px] transition-all duration-500 group-hover:scale-105"
          src={image}
          alt={alt}
          fill
        />
      </div>
      <div className="flex flex-col justify-between p-2  h-[40%]">
        <div className="flex">
          <h4 className="font-bold text-xl line-clamp-2 capitalize">{name}</h4>
          <div className="border border-current p-2 grid place-content-center h-8 rounded-lg">
            <span className="inline-block transition-all duration-300 group-hover:-translate-y-1/4 group-hover:translate-x-1/4">
              <ArrowUpRight size={20} />
            </span>
          </div>
        </div>
        <p className="line-clamp-2 text-sm  first-letter:capitalize">
          {description}
        </p>
        <p className="text-sm">{createdAt}</p>
      </div>
    </Link>
  );
};
