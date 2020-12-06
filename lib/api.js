async function fetchAPI(query, { variables } = {}) {
  console.log()
  const res = await fetch(process.env.NEXT_PUBLIC_GRAPHCMS_PROJECT_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  const json = await res.json();

  if (json.errors) {
    console.error(json.errors);
    throw new Error("Failed to fetch API");
  }

  return json.data;
}

export async function getPage(slug) {
  const data = await fetchAPI(
    `
    query Page($slug: String!) {
      page(where: {slug: $slug}) {
        id
        slug
        topLogo {
          id
          url
        }
        originPointLatitude
        originPointLongitude
        destinationPointLatitude
        destinationPointLongitude
        firstBlock {
          html
        }
        secondBlock {
          html
        }
        thirdBlock {
          html
        }
        donationBlock {
          html
        }
      }
    }`,
    {
      variables: {
        slug,
      },
    }
  );
  return data.page;
}
