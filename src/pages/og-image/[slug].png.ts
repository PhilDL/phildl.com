import type { APIContext, GetStaticPaths } from "astro";
import { getEntryBySlug } from "astro:content";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import { siteConfig } from "@/site-config";
import { getAllPosts, getFormattedDate } from "@/utils";

import RobotoMono from "@/assets/roboto-mono-regular.ttf";
import RobotoMonoBold from "@/assets/roboto-mono-700.ttf";

const ogOptions: SatoriOptions = {
  width: 1200,
  height: 630,
  // debug: true,
  fonts: [
    {
      name: "Roboto Mono",
      data: Buffer.from(RobotoMono),
      weight: 400,
      style: "normal",
    },
    {
      name: "Roboto Mono",
      data: Buffer.from(RobotoMonoBold),
      weight: 700,
      style: "normal",
    },
  ],
};

const markup = (title: string, pubDate: string) =>
  html`<div tw="flex flex-col w-full h-full bg-[#1d1f21] text-[#c9cacc]">
    <div tw="flex flex-col flex-1 w-full p-10 justify-center">
      <p tw="text-2xl mb-6">${pubDate}</p>
      <h1 tw="text-6xl font-bold leading-snug text-white">${title}</h1>
    </div>
    <div tw="flex items-center justify-between w-full p-10 border-t border-lime-500 text-xl">
      <div tw="flex items-center">
        <svg width="60" height="60" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M156.6 696.3C139.5 643.7 138.6 641 137.3 641C136.6 641 136 640.3 136 639.5C136 638.2 140 638 166 638H196L195.8 597.8L195.5 557.5L175.3 557.2L155 557V415V273L175.3 272.8L195.5 272.5L195.8 232.3L196 192H167C141.9 192 138 191.8 138 190.5C138 189.7 138.6 189 139.4 189C140.2 189 199 146.7 270.1 95C341.3 43.3 399.7 46.5 400 46.5C400.3 46.5 458.7 43.3 529.9 95C601 146.7 659.8 189 660.6 189C661.4 189 662 189.7 662 190.5C662 191.8 658.2 192 634 192H606V232.5V273H626H646V415V557H626H606V597.5V638H635C660.1 638 664 638.2 664 639.5C664 640.3 663.4 641 662.7 641C661.4 641 660.5 643.7 643.4 696.3L634.8 723H400H165.2L156.6 696.3ZM366 552.1V489.2L407.3 488.7C451.6 488.2 457.5 487.6 474.2 482.4C484.2 479.2 497.8 472.5 508 465.7C517.4 459.5 535.9 440.9 542.7 431C560 405.6 569.9 373 568.7 345C567.8 325.1 563.2 308.2 553.4 288.5C533.8 249.2 498.7 221.2 457.5 211.9C447.6 209.6 447 209.6 353.3 209.3L259 208.9V412V615H312.5H366V552.1Z"
            fill="#FC4C4C"
          ></path>
          <path
            d="M366 349V302H400.3H434.7L440.8 305.1C448.6 309 455.4 316.4 457.5 323.3C461.3 335.9 461.2 364 457.4 375.8C455.3 382.2 448.6 390.1 442.6 393.3C438.6 395.4 437.4 395.5 402.3 395.8L366 396.1V349Z"
            fill="#FC4C4C"
          ></path>
          <path
            d="M39.2 335.1C29.2 304.3 20.8 278.6 20.5 277.8C20.2 277 26.7 271.7 38.2 263.5C48.1 256.4 56.5 249.7 56.8 248.8C57 247.8 57.9 247 58.6 247C59.8 247 60 258.4 60 319C60 377.8 59.8 391 58.7 391C57.8 391 51 371.4 39.2 335.1Z"
            fill="#FC4C4C"
          ></path>
          <path
            d="M742 317C742 272.3 742.3 249 743 249C743.6 249 744 249.4 744 249.8C744 250.3 752.1 256.5 762 263.6C774.2 272.4 779.8 277 779.4 277.9C779.1 278.7 771.2 303.1 761.8 332.2C750.7 366.1 744.1 385 743.3 385C742.2 385 742 372.2 742 317Z"
            fill="#FC4C4C"
          ></path>
          <path
            d="M57 415V189H128H199L198.8 232.3L198.5 275.5L178.3 275.8L158 276V415V554L178.3 554.2L198.5 554.5L198.8 597.8L199 641H128H57V415Z"
            fill="white"
          ></path>
          <path
            d="M603 597.5V554H623H643V415V276H623H603V232.5V189H673.3H743.7L744.3 233.3C744.6 257.6 744.6 359.3 744.3 459.3L743.7 641H673.3H603V597.5Z"
            fill="white"
          ></path>
          <path
            d="M256 412V205.9L353.3 206.3C450.1 206.6 450.5 206.6 460.5 208.9C485.9 214.6 510 228.1 529 247C548.4 266.4 563.3 294.1 569.5 322C570.5 326.3 571.4 336.2 571.7 345C572.1 357.9 571.9 362.6 570.1 372.9C566.4 394.5 557.7 416.4 545.7 434C538.9 443.9 520.4 462.5 511 468.7C500.8 475.5 487.2 482.2 477.2 485.4C460.5 490.6 454.6 491.2 410.3 491.7L369 492.2V555.1V618H312.5H256V412ZM439.6 390.3C445.8 387 452.4 379.1 454.5 372.4C458 361.3 458.1 338.6 454.6 326.8C452.5 319.4 445.9 312.1 437.8 308.1L431.7 305H400.3H369V349.1V393.1L402.3 392.8C434.3 392.5 435.6 392.4 439.6 390.3Z"
            fill="white"
          ></path>
          <path
            d="M287 435.1V229L384.3 229.4C481.1 229.7 481.5 229.7 491.5 232C516.9 237.7 541 251.2 560 270.1C579.4 289.5 594.3 317.2 600.5 345.1C601.5 349.4 602.4 359.3 602.7 368.1C603.1 381 602.9 385.7 601.1 396C597.4 417.6 588.7 439.5 576.7 457.1C569.9 467 551.4 485.6 542 491.8C531.8 498.6 518.2 505.3 508.2 508.5C491.5 513.7 485.6 514.3 441.3 514.8L400 515.3V578.2V641.1H343.5H287V435.1ZM470.6 413.4C476.8 410.1 483.4 402.2 485.5 395.5C489 384.4 489.1 361.7 485.6 349.9C483.5 342.5 476.9 335.2 468.8 331.2L462.7 328.1H431.3H400V372.2V416.2L433.3 415.9C465.3 415.6 466.6 415.5 470.6 413.4Z"
            fill="black"
          ></path>
          <path
            d="M57 415V189H128H199L198.8 232.3L198.5 275.5L178.3 275.8L158 276V415V554L178.3 554.2L198.5 554.5L198.8 597.8L199 641H128H57V415Z"
            fill="white"
          ></path>
          <path
            d="M603 597.5V554H623H643V415V276H623H603V232.5V189H673.3H743.7L744.3 233.3C744.6 257.6 744.6 359.3 744.3 459.3L743.7 641H673.3H603V597.5Z"
            fill="white"
          ></path>
          <path
            d="M256 412V205.9L353.3 206.3C450.1 206.6 450.5 206.6 460.5 208.9C485.9 214.6 510 228.1 529 247C548.4 266.4 563.3 294.1 569.5 322C570.5 326.3 571.4 336.2 571.7 345C572.1 357.9 571.9 362.6 570.1 372.9C566.4 394.5 557.7 416.4 545.7 434C538.9 443.9 520.4 462.5 511 468.7C500.8 475.5 487.2 482.2 477.2 485.4C460.5 490.6 454.6 491.2 410.3 491.7L369 492.2V555.1V618H312.5H256V412ZM439.6 390.3C445.8 387 452.4 379.1 454.5 372.4C458 361.3 458.1 338.6 454.6 326.8C452.5 319.4 445.9 312.1 437.8 308.1L431.7 305H400.3H369V349.1V393.1L402.3 392.8C434.3 392.5 435.6 392.4 439.6 390.3Z"
            fill="white"
          ></path>
          <path
            d="M287 435.1V229L384.3 229.4C481.1 229.7 481.5 229.7 491.5 232C516.9 237.7 541 251.2 560 270.1C579.4 289.5 594.3 317.2 600.5 345.1C601.5 349.4 602.4 359.3 602.7 368.1C603.1 381 602.9 385.7 601.1 396C597.4 417.6 588.7 439.5 576.7 457.1C569.9 467 551.4 485.6 542 491.8C531.8 498.6 518.2 505.3 508.2 508.5C491.5 513.7 485.6 514.3 441.3 514.8L400 515.3V578.2V641.1H343.5H287V435.1ZM470.6 413.4C476.8 410.1 483.4 402.2 485.5 395.5C489 384.4 489.1 361.7 485.6 349.9C483.5 342.5 476.9 335.2 468.8 331.2L462.7 328.1H431.3H400V372.2V416.2L433.3 415.9C465.3 415.6 466.6 415.5 470.6 413.4Z"
            fill="black"
          ></path>
        </svg>
        <p tw="ml-3 font-semibold">${siteConfig.title}</p>
      </div>
      <p>by ${siteConfig.author}</p>
    </div>
  </div>`;

export async function GET({ params: { slug } }: APIContext) {
  const post = await getEntryBySlug("post", slug!);
  const title = post?.data.title ?? siteConfig.title;
  const postDate = getFormattedDate(post?.data.updatedDate ?? post?.data.publishDate ?? Date.now(), {
    weekday: "long",
    month: "long",
  });
  const svg = await satori(markup(title, postDate), ogOptions);
  const png = new Resvg(svg).render().asPng();
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllPosts();
  return posts.filter(({ data }) => !data.ogImage).map(({ slug }) => ({ params: { slug } }));
};
