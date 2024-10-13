// app/routes/action/get-pdf.tsx
import { pdf } from "@react-pdf/renderer";
import { ActionFunction } from "@remix-run/cloudflare";

import SongPDFRender from "~/components/SongPDFRender";
import SongTransformer from "~/components/SongTransformer";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const title = formData.get("title")?.toString();
  const chordpro = formData.get("chordpro")?.toString();
  const transpose = formData.get("transpose")?.toString();
  const font = formData.get("font")?.toString();

  // render the PDF
  const asPdf = pdf(
    <SongTransformer
      chordProSong={chordpro}
      transposeDelta={Number(transpose)}
      showTabs={false}>
      {songProps => (
        <SongPDFRender
          song={songProps.transformedSong}
          fontSize={Number(font)}
        />
      )}
    </SongTransformer>
  );

  const pdfBlob = await asPdf.toBlob();

  // finally create the Response with the correct Content-Type header for a PDF
  const headers = new Headers({ "Content-Type": "application/pdf" });
  return new Response(pdfBlob, { status: 200, headers });
};
