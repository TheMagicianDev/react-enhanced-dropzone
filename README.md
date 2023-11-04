# EnhancedDropZone

> This is no doc. The whole repo is a direct dump from an old project.
> React classes 16.8
> This is part of a teaching material intended in TheMagicianDev

Wrapper around `ReactDropZone` component. That does bring a large list of enhancement and features list.
- It implements all the features for upload
- With client-side drop filtering and middleware
- And media preview (thumbnail generation)
- Progress rendering with animated overlay
- Support file name rename (in the preview)
- Multiple (at once, or in parallel)
- Easy data append with each upload (that it work well in multiple files in one request, and parallel multiple requests)
- Add remove queued files from the drop zone!! in multiple mode!! (on hover, or just a visible handler (maybe just better ) !!! very important feature)
- [use dynamic functions (calculators)]
- mutators (like upload button mutator)
- Server config,
- Add multiple files in one request support [a prop to specify it]
- Good default design and can be customized.
- Multiple support for one and multiple setup (one will allow only one file )
for multiple => set multiple strategies
- Does use Axios internally, Support XHR requests params headers, and adding extra data ....etc
